import { TextChannel } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class OkZoomerCommand extends Command {
    public static readonly NAME = 'Okzoomer';

    public static readonly DESCRIPTION = 'Reacts "Ok Zoomer" onto a specified message.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private commandArgs: string[];

    /** Emoji IDs/Unicode Emojis */
    private emojiSequence = ['🆗', '🇿', '🅾️', '🇴', '🇲', '🇪', '🇷'];

    public constructor(args: string[]) {
        super();
        this.commandArgs = args;
    }

    /**
     * This method executes the ok zoomer command.
     * It reacts ok zoomer onto a specified message.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { channel, deleteFunction } = commandArgs;
        const messageId = this.commandArgs[0];

        // Delete message that sent this command to prevent spam.
        await deleteFunction!();

        try {
            const message = await (channel as TextChannel).messages.fetch(messageId);
            for (const emoji of this.emojiSequence) {
                // eslint-disable-next-line no-await-in-loop
                await message.react(emoji);
            }
        // eslint-disable-next-line no-empty
        } catch (err) {}

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
