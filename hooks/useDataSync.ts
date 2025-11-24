
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { AppState, INITIAL_STATE } from '../types';

export const useDataSync = (userSession: { email: string; name: string } | null, state: AppState) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isLoginLoading, setIsLoginLoading] = useState(!!userSession);
  const [syncedState, setSyncedState] = useState<AppState | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    if (userSession && !hasLoaded) {
      setIsLoginLoading(true);
      const load = async () => {
        try {
          const email = userSession.email;
          
          // Ensure profile exists
          let { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('email', email).single();
          
          if (!profile || profileError) {
             console.log("Creating new profile for", email);
             const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{ email, name: userSession.name, settings: INITIAL_STATE.settings }])
                .select()
                .single();
             
             if (createError) {
                 if (createError.code === '23505') {
                     const { data: retryProfile } = await supabase.from('profiles').select('*').eq('email', email).single();
                     profile = retryProfile;
                 } else {
                     throw createError;
                 }
             } else {
                 profile = newProfile;
                 await supabase.from('daily_quests').insert([{ email }]);
             }
          }

          const [tasksReq, questsReq, cardsReq, reflectionsReq] = await Promise.all([
            supabase.from('tasks').select('*').eq('email', email),
            supabase.from('daily_quests').select('*').eq('email', email).single(),
            supabase.from('flashcards').select('*').eq('email', email),
            supabase.from('reflections').select('*').eq('email', email)
          ]);

          const tasks = tasksReq.data || [];
          const quests = questsReq.data || {}; 
          const flashcards = cardsReq.data || [];
          const reflections = reflectionsReq.data || [];

          const loadedState: AppState = {
            userName: profile?.name || userSession.name,
            theThing: profile?.the_thing || '',
            celebrationVision: profile?.celebration_vision || '',
            currentNiyyah: profile?.current_niyyah || '',
            blockBalance: profile?.block_balance || 0,
            
            tasks: tasks.map((t: any) => ({
              ...t,
              isFrog: t.is_frog,
              createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
              tags: Array.isArray(t.tags) ? t.tags : [],
              blocks: t.blocks || 1,
              subtasks: typeof t.subtasks === 'string' ? JSON.parse(t.subtasks) : (t.subtasks || [])
            })),
            
            dailyQuests: {
              work: { title: quests.work_title || '', completed: quests.work_completed || false },
              health: { title: quests.health_title || '', completed: quests.health_completed || false },
              relationship: { title: quests.relationship_title || '', completed: quests.relationship_completed || false },
            },
            
            flashcards: flashcards.map((f: any) => ({ 
                ...f, 
                nextReview: Number(f.next_review) || Date.now() 
            })),
            
            reflections: reflections.map((r: any) => ({ date: r.date, content: r.content })),
            
            weeklySchedule: profile?.weekly_schedule || { current: {}, ideal: {} },
            shopItems: profile?.custom_rewards || [],
            settings: profile?.settings || INITIAL_STATE.settings
          };
          
          setSyncedState(loadedState);
          setHasLoaded(true);
        } catch (e: any) {
          console.error("Load Error:", e.message || e);
          setErrorMessage(e.message);
          setSyncedState({ ...INITIAL_STATE, userName: userSession.name });
          setSaveStatus('error');
        } finally {
          setIsLoginLoading(false);
        }
      };
      load();
    }
  }, [userSession]);

  // --- 2. SYNC DATA (Debounced & Resilient) ---
  useEffect(() => {
    if (userSession && hasLoaded && !isLoginLoading) {
        setSaveStatus('saving');
        setErrorMessage(null);
        
        const timer = setTimeout(async () => {
            const email = userSession.email;
            let hasError = false;

            // 1. Update Profile
            try {
                const profilePayload = {
                    email,
                    name: state.userName,
                    the_thing: state.theThing,
                    celebration_vision: state.celebrationVision,
                    current_niyyah: state.currentNiyyah,
                    weekly_schedule: state.weeklySchedule,
                    block_balance: state.blockBalance,
                    custom_rewards: state.shopItems,
                    settings: state.settings,
                    updated_at: new Date().toISOString()
                };

                const { error } = await supabase.from('profiles').upsert(profilePayload);
                if (error) throw error;
            } catch (e: any) {
                console.error("Sync Error (Profile):", e.message);
                if (e.message?.includes('column')) setErrorMessage("DB Schema Error (Profiles)");
                hasError = true;
            }

            // 2. Update Daily Quests
            try {
                const { error } = await supabase.from('daily_quests').upsert({
                    email,
                    work_title: state.dailyQuests?.work?.title || '',
                    work_completed: state.dailyQuests?.work?.completed || false,
                    health_title: state.dailyQuests?.health?.title || '',
                    health_completed: state.dailyQuests?.health?.completed || false,
                    relationship_title: state.dailyQuests?.relationship?.title || '',
                    relationship_completed: state.dailyQuests?.relationship?.completed || false,
                    updated_at: new Date().toISOString()
                });
                if (error) throw error;
            } catch (e: any) {
                console.error("Sync Error (Quests):", e.message);
                if (e.message?.includes('column')) setErrorMessage("DB Schema Error (Quests)");
                hasError = true;
            }

            // 3. Update Tasks
            try {
                if (state.tasks.length > 0) {
                     const tasksToUpsert = state.tasks.map(t => ({
                        id: t.id,
                        email,
                        title: t.title,
                        completed: t.completed,
                        quadrant: t.quadrant,
                        is_frog: t.isFrog,
                        purpose: t.purpose || '',
                        tags: t.tags || [],
                        blocks: t.blocks || 1,
                        created_at: new Date(t.createdAt).toISOString(),
                        subtasks: t.subtasks || [] 
                    }));
                    const { error } = await supabase.from('tasks').upsert(tasksToUpsert);
                    if (error) throw error;
                }
                
                // Cleanup deleted tasks
                const { data: dbTasks } = await supabase.from('tasks').select('id').eq('email', email);
                if (dbTasks) {
                    const currentIds = new Set(state.tasks.map(t => t.id));
                    const toDelete = dbTasks.filter((t: any) => !currentIds.has(t.id)).map((t: any) => t.id);
                    if (toDelete.length > 0) {
                        await supabase.from('tasks').delete().in('id', toDelete);
                    }
                }
            } catch (e: any) {
                console.error("Sync Error (Tasks):", e.message);
                hasError = true;
            }

            // 4. Update Flashcards
            try {
                if (state.flashcards.length > 0) {
                    const cardsToUpsert = state.flashcards.map(f => ({
                        id: f.id,
                        email,
                        question: f.question,
                        answer: f.answer,
                        next_review: f.nextReview,
                        interval: f.interval
                    }));
                    const { error } = await supabase.from('flashcards').upsert(cardsToUpsert);
                    if (error) throw error;
                }
                // Cleanup deleted cards
                const { data: dbCards } = await supabase.from('flashcards').select('id').eq('email', email);
                if (dbCards) {
                    const currentIds = new Set(state.flashcards.map(c => c.id));
                    const toDelete = dbCards.filter((c: any) => !currentIds.has(c.id)).map((c: any) => c.id);
                    if (toDelete.length > 0) {
                        await supabase.from('flashcards').delete().in('id', toDelete);
                    }
                }
            } catch (e: any) {
                console.error("Sync Error (Cards):", e.message);
                hasError = true;
            }

            // 5. Update Reflections
            try {
                if (state.reflections.length > 0) {
                    const reflectionsToUpsert = state.reflections.map(r => ({
                        email,
                        date: r.date,
                        content: r.content
                    }));
                    const { error } = await supabase.from('reflections').upsert(reflectionsToUpsert, { onConflict: 'email, date' });
                    if (error) throw error;
                }
            } catch (e: any) {
                console.error("Sync Error (Reflections):", e.message);
                hasError = true;
            }

            if (hasError) {
                setSaveStatus('error');
            } else {
                setSaveStatus('saved');
                setErrorMessage(null);
            }
        }, 2000); // 2s debounce
        
        return () => clearTimeout(timer);
    }
  }, [state, userSession, hasLoaded, isLoginLoading]);

  return { syncedState, isLoginLoading, saveStatus, errorMessage };
};
