import { StarboardChecker } from './StarboardChecker';

export class StarboardRemoveReactChecker extends StarboardChecker {
    /**
     * This function checks if the reaction qualifies for
     * making changes to the Starboard.
     *
     * @returns Promise<[number, string] | null> null if checks fail,
     * or tuple of #of reacts + starboard channel id
     */
    public async checkRemoveReact(): Promise<[number, string] | null> {
        return new Promise<[number, string] | null>((resolve): void => {
            if (!this.standardChecks()) {
                resolve(null);
                return;
            }

            // Check if id of message appears in the Starboard
            // If exists, definitely need to update (delete or edit)
            const starboardMsgId = this.fetchStarboardId();
            if (starboardMsgId !== null) {
               // Get the count of the number of
               // reactions of starboard emoji.
                this.getNumberOfReactions()
                    .then((size: number): void => {
                        resolve([size, starboardMsgId]);
                    });
            } else {
                resolve(null);
            }
        });
    }
}
