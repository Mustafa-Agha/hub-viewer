import { makeAutoObservable } from 'mobx';

class MainStore
{
    public selectedKey: string = '2';

    constructor()
    {
        makeAutoObservable(this);
    }

    public selectKey = (key: string) =>
    {
        this.selectedKey = key;
    }
}

export default MainStore;