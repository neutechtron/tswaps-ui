const routes = [
  {
    path: "/home",
    component: () => import("pages/HomePage.vue")
  },
  {
    path: "/swap",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "swap", component: () => import("pages/swap.vue") }
    ]
  },
  {
    path: "/liquidity",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "liquidity",
        component: () => import("pages/liquidity.vue")
      }
    ]
  },
  {
    path: "/pools",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "pools", component: () => import("pages/pools.vue") }
    ]
  },
  {
    path: "/",
    component: () => import("layouts/BridgeLayout.vue"),
    children: [
      { path: "", name: "bridge", component: () => import("pages/bridge.vue") }
    ]
  },

  // Commented untill the state management is stable
  // {
  //   path: "/bridge",
  //   component: () => import("layouts/MainLayout.vue"),
  //   children: [{ path: "", name:"bridge", component: () => import("pages/Bridge.vue") }]
  // },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
