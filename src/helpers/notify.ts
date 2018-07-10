import Notify from 'notifyjs';

const turnNotice = new Notify('Ownitama', {body: 'It\s your turn' });

export const  askPermisiion = () => { 
    if (Notify.needsPermission && Notify.isSupported() && Notify.requestPermission) {
        Notify.requestPermission();
    }
}

export const notifyTurn = () => {
    if (!Notify.needsPermission) {
        turnNotice.show();
    } else if (Notify.isSupported()) {
        Notify.requestPermission(turnNotice.show);
    }
}