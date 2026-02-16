const Hall = {
    initialize: function() {
        console.log('Initializing Hall of Autism');
        const hallContainer = document.getElementById('hall-container');
        if (!hallContainer) {
            console.error('Hall container not found');
            return;
        }
        
        hallContainer.innerHTML = '';

        const hallItems = [
            { 
                name: "Mihai Caradan", 
                description: "reasons:toxic, manipulationer, fakes that hes an kid with many non responsibilities that he said it for attention, mocks girls for the gayness that he is", 
                image: "https://i.postimg.cc/ydG19g3W/image.png" 
            },
            { 
                name: "Azcox (david)", 
                description: "reason:an wanna be discord drowner who thinks his opsec is good but he actually got full drowned by exotic slasher and void", 
                image: "https://i.postimg.cc/3rp3jy1q/expoze1.jpg" 
            },
            { 
                name: "bloodbath", 
                description: "Untitled", 
                image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+3" 
            },
            { 
                name: "Noone", 
                description: "Untitled", 
                image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+4" 
            },
            { 
                name: "Noone", 
                description: "Untitled", 
                image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+5" 
            },
            { 
                name: "Noone", 
                description: "Untitled", 
                image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+6" 
            },
            { 
                name: "Noone", 
                description: "Untitled", 
                image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+7" 
            },
            { 
                name: "Noone", 
                description: "Untitled", 
                image: "https://via.placeholder.com/400x300/000000/ffffff?text=Image+8" 
            }
        ];

        hallItems.forEach(item => {
            const box = document.createElement('div');
            box.className = 'hall-box';
            
            const imageDiv = document.createElement('div');
            imageDiv.className = 'hall-image';
            
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/400x300/000000/ffffff?text=Error';
            };
            
            imageDiv.appendChild(img);
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'hall-name';
            nameDiv.textContent = item.name;
            
            const descDiv = document.createElement('div');
            descDiv.className = 'hall-description';
            descDiv.textContent = item.description;
            
            box.appendChild(imageDiv);
            box.appendChild(nameDiv);
            box.appendChild(descDiv);
            
            hallContainer.appendChild(box);
        });

        console.log('Hall of Autism initialized with', hallItems.length, 'items');
    }
};

window.Hall = Hall;
