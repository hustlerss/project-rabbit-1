const exe = require('../connection');

(async () => {
    try {
        const updates = [
            { name: 'Web Development', link: '/ready-project-details' },
            { name: 'Mini Projects', link: '/mini-project-details' },
            { name: 'Bundle Projects', link: '/bundle-project-details' },
            { name: 'AI / ML Projects', link: '/ai-project-list' },
            { name: 'Mobile Apps', link: '/mobile-project-list' },
            { name: 'Full Stack Projects', link: '/fullstack-project-list' }
        ];

        for (const up of updates) {
            await exe("UPDATE categories SET link = ? WHERE name = ?", [up.link, up.name]);
        }

        console.log('Database links updated successfully');
        process.exit(0);
    } catch (e) {
        console.error('Error updating database:', e);
        process.exit(1);
    }
})();
