import { BALLS_PER_OVER } from "@/utils/constants";

/**
 * Calculate overs from total balls
 */
export function calculateOvers(totalBalls: number): string {
    const overs = Math.floor(totalBalls / BALLS_PER_OVER);
    const balls = totalBalls % BALLS_PER_OVER;
    return `${overs}.${balls}`;
}

/**
 * Calculate run rate
 */
export function calculateRunRate(runs: number, totalBalls: number): string {
    if (totalBalls === 0) return "0.00";
    const overs = totalBalls / BALLS_PER_OVER;
    return (runs / overs).toFixed(2);
}

/**
 * Get ball number and over from total balls
 */
export function getBallAndOver(totalBalls: number): { over: number; ball: number } {
    return {
        over: Math.floor(totalBalls / BALLS_PER_OVER),
        ball: totalBalls % BALLS_PER_OVER,
    };
}

/**
 * Format match score display
 */
export function formatScore(runs: number, wickets: number): string {
    return `${runs}/${wickets}`;
}

/**
 * Check if innings is complete (10 wickets or overs done)
 */
export function isInningsComplete(wickets: number, maxWickets: number = 10): boolean {
    return wickets >= maxWickets;
}

/**
 * Get batting team's remaining wickets
 */
export function getRemainingWickets(wickets: number, totalPlayers: number): number {
    return Math.max(0, totalPlayers - 1 - wickets);
}
