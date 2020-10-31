/* eslint-disable no-unused-expressions */

import {
    SkynetClient,
    keyPairFromSeed
} from "skynet-js";

const skynetClient = new SkynetClient("https://siasky.net");

const userDataKey = "userData.json";
const userImagesDataKey = "userImages.json";


const nickNameKey = "nickname";

interface UserImage {
    name?: string
    added: Date
    tags?: string[]
    skylink: string
}

class User {
    private nickname: string;
    private authenticated: boolean;
    private publicKey: any
    private privateKey: any

    constructor() {
        this.nickname = "";
        this.authenticated = false;
    }

    public async Login(passphrase: string): Promise<void> {
        const { publicKey, privateKey } = keyPairFromSeed(passphrase);
        this.publicKey = publicKey
        this.privateKey = privateKey
        this.authenticated = true;

        try {
            const { data } = await skynetClient.db.getJSON(
                publicKey,
                userDataKey,
            );
            if (data && nickNameKey in data) {
                this.nickname = data[nickNameKey];
            }
        } catch (error) {
            console.log(error)
            console.log("no user with the given passphrase, setting new one")
            await this.SetNickname(this.nickname);
        }
    }

    public IsAuthenticated(): boolean {
        return this.authenticated;
    }

    public Nickname(): string {
        return this.nickname;
    }

    public async SetNickname(nickname: string): Promise<void> {
        try {
            await skynetClient.db.setJSON(this.privateKey, userDataKey, { nickname });
        } catch (error) {
            console.log(error)
            console.log("could not set nickname")
        }
    }

    public async GetImages(): Promise<UserImage[]> {
        try {
            const { data } = await skynetClient.db.getJSON(this.publicKey, userImagesDataKey);
            if (data) {
                let ui: UserImage[] = JSON.parse(data);
                return ui
            }
        } catch (error) {
            console.log(error)
            console.log("no user images, init")
            await this.initImages();
        }
        return [];
    }

    public async AddImage(file: File): Promise<string> {
        try {
            const skylink = await skynetClient.uploadFile(file);
            let images = await this.GetImages();

            images.push({
                added: new Date(Date.now()),
                skylink: skylink
            });

            await skynetClient.db.setJSON(this.privateKey, userImagesDataKey, JSON.stringify(images));

            return skylink;
        } catch (error) {
            console.log(error)
            console.log("no user images, init")
            await this.initImages();
        }

        return "";
    }

    public async initImages(): Promise<void> {
        try {
            await skynetClient.db.setJSON(this.privateKey, userImagesDataKey, JSON.stringify([]));
        } catch (error) {
            console.log(error)
            console.log("could not init user images")
        }
    }
}

export default User;