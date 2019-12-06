import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerHelpCommand extends HelpCommandBase {
    public static HEADER = '__Message Checker Commands__'

    /**
     * This method sends a help embed for the MsgChecker module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const { messageReply } = commandArgs;

        // Generate embed and send
        messageReply(this.generateEmbed(
            MsgCheckerHelpCommand.HEADER,
            CommandNamesAndDescriptions.MSGCHECKER_COMMANDS,
            CommandNamesAndDescriptions.MSGCHECKER_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
