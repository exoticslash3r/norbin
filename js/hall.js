// Hall of Autism Module
const Hall = (function() {
    function initialize() {
        const hallContainer = document.getElementById('hall-container');
        hallContainer.innerHTML = '';

        const hallItems = [
            { name: "Mihai Caradan", description: "reasons:toxic, manipulationer, fakes that hes an kid with many non responsibilities that he said it for attention, mocks girls for the gayness that he is", image: "https://i.postimg.cc/ydG19g3W/image.png" },
            { name: "Azcox (david)", description: "reason:an wanna be discord drowner who thinks his opsec is good but he actually got full drowned by exotic slasher and void", image: "https://i.postimg.cc/3rp3jy1q/expoze1.jpg" },
            { name: "Noone", description: "Untitled", image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+3" },
            { name: "Noone", description: "Untitled", image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+4" },
            { name: "Noone", description: "Untitled", image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+5" },
            { name: "Noone", description: "Untitled", image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+6" },
            { name: "Noone", description: "Untitled", image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+7" },
            { name: "Noone", description: "Untitled", image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+8" }
        ];

        hallItems.forEach(item => {
            const box = document.createElement('div');
            box.className = 'hall-box';
            box.innerHTML = `
                <div class="hall-image">
                    <img src="${Utils.sanitizeHTML(item.image)}" alt="${Utils.sanitizeHTML(item.name)}" onerror="this.src='https://via.placeholder.com/400x300/000000/ffffff?text=Error'">
                </div>
                <div class="hall-name">${Utils.sanitizeHTML(item.name)}</div>
                <div class="hall-description">${Utils.sanitizeHTML(item.description)}</div>
            `;
            hallContainer.appendChild(box);
        });

        if (!document.getElementById('hall-page').classList.contains('hidden')) {
            document.getElementById('hallMusic').play().catch(() => {});
        }
    }

    return {
        initialize
    };
})();
