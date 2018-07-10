import Notify from 'notifyjs';
import { ChatMessage} from '../interfaces';
const turnNotice = new Notify('Ownitama', {body: 'It\s your turn' });

export const  askPermisiion = () => { 
    if (Notify.needsPermission && Notify.isSupported() && Notify.requestPermission) {
        Notify.requestPermission();
    }
}

export const notifyChat = (message:ChatMessage) => {
    const chatNotice = new Notify(message.playerName, {body: message.message});

    if (!Notify.needsPermission) {
        chatNotice.show();
    } else if (Notify.isSupported()) {
        Notify.requestPermission(chatNotice.show);
    }
}

export const notifyTurn = () => {
    if (!Notify.needsPermission) {
        turnNotice.show();
    } else if (Notify.isSupported()) {
        Notify.requestPermission(turnNotice.show);
    }
}