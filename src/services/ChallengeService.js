/**
 * Challenge Service - Supabase operations for Community Challenges
 */

import { supabase } from './supabaseClient';

/**
 * Create a new community challenge
 * @param {string} creatorName - Username of creator
 * @param {string} title - Challenge title
 * @param {Array} scenarios - Array of 3 scenario objects
 * @returns {Object} - { data, error }
 */
export const createChallenge = async (creatorName, title, scenarios) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Must be logged in to create challenges' };
        }

        const { data, error } = await supabase
            .from('community_challenges')
            .insert({
                creator_id: user.id,
                creator_name: creatorName,
                title: title,
                scenarios: scenarios
            })
            .select()
            .single();

        if (error) throw error;

        console.log('[ChallengeService] Created challenge:', data.id);
        return { data, error: null };

    } catch (error) {
        console.error('[ChallengeService] Create error:', error);
        return { data: null, error: error.message };
    }
};

/**
 * Get all active (non-expired) challenges
 * @returns {Object} - { data: [], error }
 */
export const getChallenges = async () => {
    try {
        const { data, error } = await supabase
            .from('community_challenges')
            .select('*')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('[ChallengeService] Fetched', data.length, 'active challenges');
        return { data, error: null };

    } catch (error) {
        console.error('[ChallengeService] Fetch error:', error);
        return { data: [], error: error.message };
    }
};

/**
 * Increment play count for a challenge
 * @param {string} challengeId - UUID of challenge
 * @returns {Object} - { success, error }
 */
export const incrementPlays = async (challengeId) => {
    try {
        // First get current count
        const { data: current } = await supabase
            .from('community_challenges')
            .select('plays_count')
            .eq('id', challengeId)
            .single();

        // Increment
        const { error } = await supabase
            .from('community_challenges')
            .update({ plays_count: (current?.plays_count || 0) + 1 })
            .eq('id', challengeId);

        if (error) throw error;

        console.log('[ChallengeService] Incremented plays for:', challengeId);
        return { success: true, error: null };

    } catch (error) {
        console.error('[ChallengeService] Increment error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get time remaining until expiry
 * @param {string} expiresAt - ISO timestamp
 * @returns {string} - Human readable time remaining
 */
export const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;

    if (diffMs <= 0) return 'Expired';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
        return `${days}d ${remainingHours}h left`;
    }
    return `${hours}h left`;
};
