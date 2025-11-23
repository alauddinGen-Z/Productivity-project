
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { AppState, INITIAL_STATE } from '../types';

export const useDataSync = (userSession: { email: string; name: string } | null, state: AppState) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [syncedState, setSyncedState] = useState<AppState>(INITIAL_STATE);

  // Load Data
  useEffect(() => {
    if (userSession) {
      setIsLoginLoading(true);
      const load = async () => {
        try {
          const email = userSession.email;
          let { data: profile, error } = await supabase.from('profiles').select('*').eq('email', email).single();

          if (!profile || error) {
            const { data: newProfile } = await supabase.from('profiles').insert([{ email, name: userSession.name }]).select().single();
            profile = newProfile;
            await supabase.from('daily_quests').insert([{ email }]);
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
              createdAt: t.created_at,
              tags: Array.isArray(t.tags) ? t.tags : [],
              blocks: t.blocks || 1,
              subtasks: Array.isArray(t.subtasks) 
                ? t.subtasks.map((st: any) => typeof st === 'string' ? { title: st, completed: false } : st)
                : undefined
            })),
            dailyQuests: {
              work: { title: quests.work_title || '', completed: quests.work_completed || false },
              health: { title: quests.health_title || '', completed: quests.health_completed || false },
              relationship: { title: quests.relationship_title || '', completed: quests.relationship_completed || false },
            },
            flashcards: flashcards.map((f: any) => ({ ...f, nextReview: f.next_review })),
            reflections: reflections.map((r: any) => ({ date: r.date, content: r.content })),
            weeklySchedule: profile?.weekly_schedule || { current: {}, ideal: {} },
            customRewards: profile?.custom_rewards || []
          };
          
          setSyncedState(loadedState);
        } catch (e) {
          console.error(e);
          setSyncedState({ ...INITIAL_STATE, userName: userSession.name });
        } finally {
          setIsLoginLoading(false);
        }
      };
      load();
    }
  }, [userSession]);

  // Sync Data
  useEffect(() => {
    if (userSession && !isLoginLoading) {
        // Prevent syncing empty initial state over data
        if (state === INITIAL_STATE && state.tasks.length === 1) return;

        setSaveStatus('saving');
        const timer = setTimeout(async () => {
            try {
                const email = userSession.email;
                await supabase.from('profiles').upsert({
                    email,
                    name: state.userName,
                    the_thing: state.theThing,
                    celebration_vision: state.celebrationVision,
                    current_niyyah: state.currentNiyyah,
                    weekly_schedule: state.weeklySchedule,
                    block_balance: state.blockBalance,
                    custom_rewards: state.customRewards
                });

                await supabase.from('daily_quests').upsert({
                    email,
                    work_title: state.dailyQuests.work.title,
                    work_completed: state.dailyQuests.work.completed,
                    health_title: state.dailyQuests.health.title,
                    health_completed: state.dailyQuests.health.completed,
                    relationship_title: state.dailyQuests.relationship.title,
                    relationship_completed: state.dailyQuests.relationship.completed,
                });
                
                // Tasks
                const tasksToUpsert = state.tasks.map(t => ({
                    id: t.id,
                    email,
                    title: t.title,
                    completed: t.completed,
                    quadrant: t.quadrant,
                    is_frog: t.isFrog,
                    purpose: t.purpose,
                    tags: t.tags,
                    blocks: t.blocks,
                    created_at: t.createdAt,
                    subtasks: t.subtasks
                }));
                if (tasksToUpsert.length > 0) await supabase.from('tasks').upsert(tasksToUpsert);
                
                // Determine deletions (simplified for this hook, normally done by diffing)
                const { data: dbTasks } = await supabase.from('tasks').select('id').eq('email', email);
                if (dbTasks) {
                    const currentIds = new Set(state.tasks.map(t => t.id));
                    const toDelete = dbTasks.filter((t: any) => !currentIds.has(t.id)).map((t: any) => t.id);
                    if (toDelete.length > 0) await supabase.from('tasks').delete().in('id', toDelete);
                }

                // Flashcards
                const cardsToUpsert = state.flashcards.map(f => ({
                    id: f.id,
                    email,
                    question: f.question,
                    answer: f.answer,
                    next_review: f.nextReview,
                    interval: f.interval
                }));
                if (cardsToUpsert.length > 0) await supabase.from('flashcards').upsert(cardsToUpsert);
                
                const { data: dbCards } = await supabase.from('flashcards').select('id').eq('email', email);
                if (dbCards) {
                    const currentIds = new Set(state.flashcards.map(c => c.id));
                    const toDelete = dbCards.filter((c: any) => !currentIds.has(c.id)).map((c: any) => c.id);
                    if (toDelete.length > 0) await supabase.from('flashcards').delete().in('id', toDelete);
                }

                // Reflections
                const reflectionsToUpsert = state.reflections.map(r => ({
                    email,
                    date: r.date,
                    content: r.content
                }));
                if (reflectionsToUpsert.length > 0) {
                    await supabase.from('reflections').upsert(reflectionsToUpsert, { onConflict: 'email, date' });
                }

                setSaveStatus('saved');
            } catch (e) {
                console.error(e);
                setSaveStatus('error');
            }
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [state, userSession, isLoginLoading]);

  return { syncedState, isLoginLoading, saveStatus };
};
