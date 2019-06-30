/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { MessageCheckerSettings } from '../../main/storage/MessageCheckerSettings';

should();

let messageCheckerSettings: MessageCheckerSettings;
beforeEach((): void => {
    messageCheckerSettings = new MessageCheckerSettings();
});

describe('messageCheckerSettings test suite', (): void => {
    describe('Getter & Setters test', (): void => {
        it('getBannedWords test', (): void => {
            messageCheckerSettings.addbannedWord('test');
            messageCheckerSettings.getBannedWords().toString().should.equals(['test'].toString());
        });
        it('set & getReportingId test', (): void => {
            (typeof messageCheckerSettings.getReportingChannelId()).should.equals('undefined');
            messageCheckerSettings.setReportingChannelId('123');
            messageCheckerSettings.getReportingChannelId()!.should.equals('123');
        });
        it('set & responseMessage test', (): void => {
            (typeof messageCheckerSettings.getResponseMessage()).should.equals('undefined');
            messageCheckerSettings.setResponseMessage('123');
            messageCheckerSettings.getResponseMessage()!.should.equals('123');
        });
    });
    describe('Add & Remove Words test', (): void => {
        it('Add duplicate word', (): void => {
            messageCheckerSettings.addbannedWord('test');
            const { length } = messageCheckerSettings.getBannedWords();
            messageCheckerSettings.addbannedWord('test').should.equals(false);
            messageCheckerSettings.getBannedWords().length.should.equals(length);
        });
        it('Add word', (): void => {
            const { length } = messageCheckerSettings.getBannedWords();
            messageCheckerSettings.addbannedWord('testing').should.equals(true);
            messageCheckerSettings.getBannedWords().length.should.equals(length + 1);
        });
        it('Remove word', (): void => {
            messageCheckerSettings.addbannedWord('test');
            const { length } = messageCheckerSettings.getBannedWords();
            messageCheckerSettings.removeBannedWord('test').should.equals(true);
            messageCheckerSettings.getBannedWords().length.should.equals(length - 1);
        });
        it('Remove non existant word', (): void => {
            const { length } = messageCheckerSettings.getBannedWords();
            messageCheckerSettings.removeBannedWord('hmmmmmmm').should.equals(false);
            messageCheckerSettings.getBannedWords().length.should.equals(length);
        });
    });
    describe('Serialising and Deserialising tests', (): void => {
        it('Deserialising test 1', (): void => {
            messageCheckerSettings.addbannedWord('test');
            const obj = MessageCheckerSettings.convertToJsonFriendly(messageCheckerSettings);
            obj.bannedWords.toString().should.equals(['test'].toString());
            (obj.reportingChannelId === null).should.be.true;
            (obj.responseMessage === null).should.be.true;
        });
        it('Deserialising test 2', (): void => {
            messageCheckerSettings.setReportingChannelId('123');
            const obj = MessageCheckerSettings.convertToJsonFriendly(messageCheckerSettings);
            obj.bannedWords.toString().should.equals([].toString());
            obj.reportingChannelId!.should.equals('123');
            (obj.responseMessage === null).should.be.true;
        });
        it('Deserialising test 3', (): void => {
            messageCheckerSettings.setResponseMessage('response msg');
            const obj = MessageCheckerSettings.convertToJsonFriendly(messageCheckerSettings);
            obj.bannedWords.toString().should.equals([].toString());
            (obj.reportingChannelId === null).should.be.true;
            obj.responseMessage!.should.equals('response msg');
        });
        it('Serialising test 1', (): void => {
            let obj: any = {};
            obj.bannedWords = ['test'];
            obj.reportingChannelId = null;
            obj.responseMessage = 'response msg';

            // Turn into json string and back
            const str = JSON.stringify(obj);
            obj = JSON.parse(str);

            const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            messageCheckerSettings_.getBannedWords().toString().should.equals(['test'].toString());
            messageCheckerSettings_.getResponseMessage()!.should.equals('response msg');
            (typeof messageCheckerSettings_.getReportingChannelId()).should.equals('undefined');
        });
        it('Serialising test 2', (): void => {
            let obj: any = {};
            obj.bannedWords = ['test'];
            obj.reportingChannelId = '123';
            obj.responseMessage = null;

            // Turn into json string and back
            const str = JSON.stringify(obj);
            obj = JSON.parse(str);

            const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            messageCheckerSettings_.getBannedWords().toString().should.equals(['test'].toString());
            (typeof messageCheckerSettings_.getResponseMessage()).should.equals('undefined');
            messageCheckerSettings_.getReportingChannelId()!.should.equals('123');
        });
        it('Serialising error test 1', (): void => {
            const obj: any = {};
            obj.bannedWords = ['test'];
            obj.reportingChannelId = '123';
            try {
                const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals('Object is not valid');
            }
        });
        it('Serialising error test 2', (): void => {
            const obj: any = {};
            obj.bannedWords = ['test'];
            obj.responseMessage = '111';
            try {
                const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals('Object is not valid');
            }
        });
        it('Serialising error test 3', (): void => {
            const obj: any = {};
            obj.responseMessage = '111';
            obj.reportingChannelId = '123';
            try {
                const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals('Object is not valid');
            }
        });
        it('Serialising error test 4', (): void => {
            const obj: any = {};
            try {
                const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals('Object is not valid');
            }
        });
    });
});
