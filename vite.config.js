import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig ({
    root: resolve(__dirname, ''),
   // base: '/dashboard',
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: {
                admin: 'admin.html',
                home: 'home.html',
                index: 'index.html',
                AkzoNop: 'AkzoNop.html',
                ApproveUser: 'ApproveUser.html',
                AwardsAtlanta: 'AwardsAtlanta.html',
                BCSI: 'BCSI.html',
                TAG: 'TAG.html',
                ViewLogins: 'ViewLogins.html',
                welcome: 'welcome.html',
                WooCommerce: 'WooCommerce.html',
            },
        },
    },
    server: {
        port: 8080
    }
});