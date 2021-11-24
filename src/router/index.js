import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'app',
    component: () => import(/* webpackChunkName: "app-layout" */ '../layout/app-layout/AppLayout.vue'),
    redirect: '/dot-word',
    children: [
      {
        path: 'dot-word',
        name: 'dotWord',
        component: () => import(/* webpackChunkName: "dotWord" */ '../views/dot-word/DotWord.vue'),
        meta: {
          title: '点阵字生成器',
        },
      },
      {
        path: 'dot-image',
        name: 'dotImage',
        component: () => import(/* webpackChunkName: "dotImage" */ '../views/dot-image/DotImage.vue'),
        meta: {
          title: '点阵图生成器',
        },
      },
      {
        path: 'paint-board',
        name: 'paintBoard',
        component: () => import(/* webpackChunkName: "paintBoard" */ '../views/paint-board/PaintBoard.vue'),
        meta: {
          title: '画图板',
        },
      },
      {
        path: 'pixel-art',
        name: 'pixelArt',
        component: () => import(/* webpackChunkName: "pixelArt" */ '../views/pixel-art/PixelArt'),
        meta: {
          title: '像素编辑',
        },
      },
      {
        path: 'yugioh',
        name: 'yugioh',
        component: () => import(/* webpackChunkName: "yugioh" */ '../views/yugioh/Yugioh.vue'),
        meta: {
          title: '游戏王卡片生成器',
        },
      },
    ],
  },
  {
    path: '/share',
    name: 'share',
    component: () => import(/* webpackChunkName: "blank-layout" */ '../layout/blank-layout/BlankLayout.vue'),
    children: [
      {
        path: 'yugioh',
        name: 'shareYugioh',
        component: () => import(/* webpackChunkName: "share-yugioh" */ '../views/share/yugioh/Yugioh.vue'),
        meta: {
          title: '游戏王卡片分享',
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
