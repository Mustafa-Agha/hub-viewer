import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';

class MainStore
{
    public myID: number = 0;
    public mySecret: string = '';

    public connected: boolean = false;
    public selectedKey: string = '2';
    public footerMsg: string = 'Connecting...';
    public footerType: any = 'warning';

    constructor()
    {
        let uuid = uuidv4();
        let secret = uuid.split('-')[0];
        let id = Math.floor(100000000 + Math.random() * 900000000);
        this.myID = id;
        this.mySecret = secret;

        makeAutoObservable(this);
    }

    public changeMySecret = () => {
        let uuid = uuidv4();
        let secret = uuid.split('-')[0];
        this.mySecret = secret;
    }

    public selectKey = (key: string) =>
    {
        this.selectedKey = key;
    }

    public notify = (msg: string, type: string) => {
        this.footerMsg = msg;
        this.footerType = type;
    };
}

export default MainStore;