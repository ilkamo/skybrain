# [Skybrain](https://skybrain.hns.siasky.net/)

![Skybrain logo](https://siasky.net/KAAuqcLCyG-KW1JiQYDDZHxn8AXzCQhD-gKe9mZChfoqFg)

## Mission
Skybrain wants to be the core of the entire "Sia sky" ecosystem, the place where magic happens and all memories and emotions are stored, like in the human brain. Sign up and start sharing your memories. Photos, videos, audio notes, text. Store all you want in the Skybrain.

All your memories are private by default. With one click, you can share them with the public (**public memory**). You can also decide to share memories by link without making them public (**shared memory by link**). Have under control the access to your memories. It is like in the real life. Talk in public or share a secret with your best friend.

## Vision
**Brain** and **connections** are the main concept of Skybrain. Sharing your public key, others brains are able to connect with your **public memories**. At the same time, your brain **can connect** with memories of other brains. In this way your *Skybrain* is always up to date about all your connections and you can see all the memories in a single place. 

That's not all, there is one more thing. For how Skybrain is organized, its satellite apps can access brains public memories. Imagine something like *Skyprint*. You paste your public key and bom! You are able to list all your public photos from Skybrain, create an album and order an online print of it. Or even better. Imagine to use something like *Skyeditor*. Select your favorites memories and create a happy birthday movie for a person you love. It's like a magic. And these are just a **few of the infinite ideas you can build up on Skybrain**. 

## Skybrain architecture
![Skydb architecture](https://siasky.net/vAB_ei6xU1JbeoEhyoSz08aAuwbK8UqgzchNFRXuOFX4XA)

Miro board link: [Skybrain architecture](https://miro.com/app/board/o9J_kgIoX7E=/)

This architecture was created for the purposes of the hackathon with just a few iterations. Feel free to challenge it in order to improve Skybrain security and functionalities. Your comments, opinions and suggestions are welcome.

## Main functionalities
1. Add and keep memory
2. Make memory public
3. Share memory by link
4. Unshare memory
5. Forget memory
6. Aggregated memories and connections
7. Brain profile
8. Navigation breadcrumbs
9. Clean responsive design

We recorded a few short videos in order to explain how Skybrain works. [Visit this brain connection](https://skybrain.hns.siasky.net/#/connection/669ee4eaf08ed6beb1e1ea13bafc84de39f2ffe38cfccae6374d5794e687f1dd) to display them.

At the same time, having a look at [these memories](https://skybrain.hns.siasky.net/#/connection/aa804900a3386bb436640d90438ef3d566e07061e388e1a511d565038a026c0f) you can see how powerful is now Skybrain. You can also understand how much work and dedication it took us to develop a service like this.

The hackathon was three weeks long and it was a continuous thinking about what to bring to the end and what to sacrifice in order to have a working product at the end. For this reason other cool features will be introduced after the hackathon. We first thought about the essentials needed to make Skybrain a working idea that people will love.

## Access Skybrain public data

Fetching Skybrain public data is easy like writing a basic Hello world! All you need is the public key of the user.

```
const response = await this.skynetClient.db.getJSON(
  {PUBLIC_KEY},
  'SKYBRAIN__USER_PUBLIC_MEMORIES',
  {
    timeout: 6000,
  },
);

const userPublicMemories = response.data as UserPublicMemory[];
```

The returned structures are described here: 
- [UserPublicMemory](https://github.com/kamy22/skybrain/blob/master/src/app/models/user-public-memories.ts)
- [UserMemory](https://github.com/kamy22/skybrain/blob/master/src/app/models/user-memory.ts)

## Development server

Run `yarn install` & `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
