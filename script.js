// Chatcito-Jada - Chatbot JavaScript
class ChatcitoJada {
    constructor() {
        this.url = 'https://f0033bfb67b0.ngrok-free.app/webhook/23baeb49-6cb7-42a1-86b9-3d07d592b658';
        this.messages = [];
        this.context = {
            personality: '',
            knowledge: '',
            instructions: '',
            examples: ''
        };
        this.isTyping = false;
        this.userId = this.generateUserId();
        this.hasCompletedSetup = localStorage.getItem('chatcito-jada-setup-completed') === 'true';

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadContext();
        this.setupAutoResize();
        this.displayUserId();

        // Show welcome page if setup not completed
        if (!this.hasCompletedSetup) {
            this.showWelcomePage();
        } else {
            this.showChatPage();
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.closest('.nav-btn').dataset.section);
            });
        });

        // Chat functionality
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');

        sendBtn.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Context management
        document.getElementById('save-context').addEventListener('click', () => this.saveContext());
        document.getElementById('reset-context').addEventListener('click', () => this.resetContext());
        document.getElementById('reset-user-id').addEventListener('click', () => this.resetUserId());
        document.getElementById('reset-setup').addEventListener('click', () => this.resetSetup());

        // Context form inputs
        const contextInputs = ['ai-personality', 'ai-knowledge', 'ai-instructions', 'ai-examples'];
        contextInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updatePreview());
        });

        // Welcome page events
        document.getElementById('custom-context-btn').addEventListener('click', () => this.showCustomContextForm());
        document.getElementById('random-context-btn').addEventListener('click', () => this.showRandomContext());
        document.getElementById('default-context-btn').addEventListener('click', () => this.setDefaultContext());
        document.getElementById('start-chat-btn').addEventListener('click', () => this.startChat());
        document.getElementById('skip-setup-btn').addEventListener('click', () => this.skipSetup());
        document.getElementById('regenerate-random').addEventListener('click', () => this.generateRandomContext());
    }

    switchSection(sectionName) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-white', 'text-primary-600', 'shadow-sm');
            btn.classList.add('text-gray-600', 'hover:bg-gray-50');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active', 'bg-white', 'text-primary-600', 'shadow-sm');
        document.querySelector(`[data-section="${sectionName}"]`).classList.remove('text-gray-600', 'hover:bg-gray-50');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(`${sectionName}-section`).classList.remove('hidden');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        this.autoResize(input);

        // Show typing indicator
        this.showTypingIndicator();

        const response = await this.generateResponse(message);
        this.addMessage(response, 'bot');
        this.hideTypingIndicator();
    }

    // Just HTML elements
    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message flex space-x-2 sm:space-x-3 mb-4 sm:mb-6`;

        const avatar = document.createElement('div');
        avatar.className = `flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 ${sender === 'bot' ? 'bg-primary-500' : 'bg-gray-500'} text-white rounded-full flex items-center justify-center`;
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot text-sm sm:text-base"></i>' : '<i class="fas fa-user text-sm sm:text-base"></i>';

        const messageContent = document.createElement('div');
        messageContent.className = `flex-1 ${sender === 'bot' ? 'bg-white border border-gray-200' : 'bg-primary-500 text-white'} p-3 sm:p-4 rounded-lg`;

        const messageText = document.createElement('p');
        messageText.className = sender === 'bot' ? 'text-gray-800 mb-2 text-sm sm:text-base' : 'text-white mb-2 text-sm sm:text-base';
        messageText.textContent = content;

        const messageTime = document.createElement('span');
        messageTime.className = `text-xs ${sender === 'bot' ? 'text-gray-500' : 'text-white opacity-70'}`;
        messageTime.textContent = this.getCurrentTime();

        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Store message
        this.messages.push({ content, sender, timestamp: new Date() });
    }

    generateUserId() {
        // Check if user ID already exists in localStorage
        let userId = localStorage.getItem('chatcito-jada-user-id');

        if (!userId) {
            // Generate a unique user ID using timestamp + random string
            const timestamp = Date.now().toString(36);
            const randomStr = Math.random().toString(36).substring(2, 15);
            const sessionId = Math.random().toString(36).substring(2, 10);
            userId = `user_${timestamp}_${randomStr}_${sessionId}`;

            // Save to localStorage
            localStorage.setItem('chatcito-jada-user-id', userId);
        }

        return userId;
    }

    getUserId() {
        return this.userId;
    }

    displayUserId() {
        const userDisplay = document.getElementById('user-id-display');
        if (userDisplay) {
            // Show only the last 8 characters of the user ID for privacy
            const shortId = this.userId.substring(this.userId.length - 8);
            userDisplay.textContent = `ID: ${shortId}`;
            userDisplay.title = `Full ID: ${this.userId}`;
        }
    }

    showWelcomePage() {
        document.getElementById('welcome-section').classList.remove('hidden');
        document.getElementById('chat-section').classList.add('hidden');
        document.getElementById('context-section').classList.add('hidden');

        // Hide navigation buttons during welcome
        document.querySelectorAll('.nav-btn').forEach(btn => btn.style.display = 'none');
    }

    showChatPage() {
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('chat-section').classList.remove('hidden');
        document.getElementById('context-section').classList.add('hidden');

        // Show navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.style.display = 'flex');

        // Set active state for chat button
        this.switchSection('chat');

        // Generate initial AI message
        this.generateInitialMessage();
    }

    showCustomContextForm() {
        document.getElementById('custom-context-form').classList.remove('hidden');
        document.getElementById('random-context-preview').classList.add('hidden');

        // Update button states
        document.querySelectorAll('.context-type-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-offset-2');
        });
        document.getElementById('custom-context-btn').classList.add('ring-2', 'ring-offset-2', 'ring-primary-500');
    }

    showRandomContext() {
        document.getElementById('custom-context-form').classList.add('hidden');
        document.getElementById('random-context-preview').classList.remove('hidden');

        // Update button states
        document.querySelectorAll('.context-type-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-offset-2');
        });
        document.getElementById('random-context-btn').classList.add('ring-2', 'ring-offset-2', 'ring-green-500');

        // Generate random context
        this.generateRandomContext();
    }

    setDefaultContext() {
        this.context = {
            personality: 'Eres un experto de reclutamiento y te llamas Juan Ga.',
            knowledge: 'Actua como un experto en reclutamiento y tienes un amplio conocimiento de las mejores prácticas de reclutamiento',
            instructions: 'Siempre debes ser optimista y motivador. Consigue el nombre del candidato y sus datos personales. No puedes salirte del tema. Considera que el usuario no tiene nombre a menos que se le indique.',
            examples: ''
        };

        // Update button states
        document.querySelectorAll('.context-type-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-offset-2');
        });
        document.getElementById('default-context-btn').classList.add('ring-2', 'ring-offset-2', 'ring-gray-500');

        // Hide forms
        document.getElementById('custom-context-form').classList.add('hidden');
        document.getElementById('random-context-preview').classList.add('hidden');

        this.showNotification('Contexto de reclutamiento seleccionado', 'success');
    }

    generateRandomContext() {
        const personalities = [
            'Eres un asistente creativo y artístico que ama la innovación',
            'Eres un mentor sabio y paciente que guía con experiencia',
            'Eres un coach motivacional energético y positivo',
            'Eres un consultor profesional formal pero accesible',
            'Eres un amigo cercano que habla de manera casual y amigable',
            'Eres un profesor académico que explica conceptos complejos de manera simple',
            'Eres un terapeuta empático que escucha y apoya emocionalmente',
            'Eres un entrenador deportivo que motiva con energía y disciplina'
        ];

        const knowledgeAreas = [
            'Tienes amplio conocimiento en tecnología y programación',
            'Eres experto en marketing digital y estrategias de negocio',
            'Tienes experiencia en psicología y desarrollo personal',
            'Eres especialista en finanzas personales e inversiones',
            'Tienes conocimiento profundo en salud y bienestar',
            'Eres experto en educación y metodologías de aprendizaje',
            'Tienes experiencia en relaciones interpersonales y comunicación',
            'Eres especialista en productividad y gestión del tiempo'
        ];

        const instructions = [
            'Siempre mantén un tono positivo y motivador',
            'Usa analogías y ejemplos prácticos para explicar conceptos',
            'Haz preguntas reflexivas para guiar el aprendizaje',
            'Proporciona pasos específicos y accionables',
            'Reconoce los logros y progresos del usuario',
            'Adapta tu respuesta al nivel de conocimiento del usuario',
            'Sé directo y conciso en tus respuestas',
            'Incluye elementos de humor cuando sea apropiado'
        ];

        const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
        const randomKnowledge = knowledgeAreas[Math.floor(Math.random() * knowledgeAreas.length)];
        const randomInstructions = instructions[Math.floor(Math.random() * instructions.length)];

        // Update display
        document.getElementById('random-personality').textContent = randomPersonality;
        document.getElementById('random-knowledge').textContent = randomKnowledge;
        document.getElementById('random-instructions').textContent = randomInstructions;

        // Store in context
        this.context = {
            personality: randomPersonality,
            knowledge: randomKnowledge,
            instructions: randomInstructions,
            examples: ''
        };
    }

    startChat() {
        // Save context from welcome form if custom was selected
        if (!document.getElementById('custom-context-form').classList.contains('hidden')) {
            this.context = {
                personality: document.getElementById('welcome-personality').value || this.context.personality,
                knowledge: document.getElementById('welcome-knowledge').value || this.context.knowledge,
                instructions: document.getElementById('welcome-instructions').value || this.context.instructions,
                examples: document.getElementById('welcome-examples').value || this.context.examples
            };
        }

        // Save context to localStorage
        localStorage.setItem('chatcito-jada-context', JSON.stringify(this.context));
        localStorage.setItem('chatcito-jada-setup-completed', 'true');

        // Show chat page
        // Show chat page and generate initial message
        this.showChatPage();

        this.showNotification('¡Bienvenido al chat! Tu contexto ha sido configurado.', 'success');
    }

    skipSetup() {
        // Use default context
        this.context = {
            personality: 'Eres un asistente de reclutamiento optimista y motivador',
            knowledge: 'Eres un experto en reclutamiento y tienes un amplio conocimiento de las mejores prácticas de reclutamiento',
            instructions: 'Siempre debes ser optimista y motivador. Consigue el nombre del candidato y sus datos personales. No puedes salirte del tema.',
            examples: ''
        };

        localStorage.setItem('chatcito-jada-context', JSON.stringify(this.context));
        localStorage.setItem('chatcito-jada-setup-completed', 'true');

        // Show chat page and generate initial message
        this.showChatPage();
        this.showNotification('Configuración omitida. Usando contexto por defecto.', 'info');
    }

    resetSetup() {
        if (confirm('¿Estás seguro de que quieres volver a la página de configuración inicial? Esto reiniciará tu experiencia.')) {
            // Clear setup completion flag
            localStorage.removeItem('chatcito-jada-setup-completed');
            document.querySelector('#chat-messages').innerHTML = '';

            // Reset to welcome page
            this.hasCompletedSetup = false;
            this.showWelcomePage();

            // Clear any selected context
            document.getElementById('custom-context-form').classList.add('hidden');
            document.getElementById('random-context-preview').classList.add('hidden');

            // Clear button states
            document.querySelectorAll('.context-type-btn').forEach(btn => {
                btn.classList.remove('ring-2', 'ring-offset-2');
            });

            this.showNotification('Volviendo a la configuración inicial...', 'info');
        }
    }

    resetUserId() {
        // Clear existing user ID and generate a new one
        localStorage.removeItem('chatcito-jada-user-id');

        // Generate new user ID
        this.userId = this.generateUserId();
        this.displayUserId();

        this.showNotification('Nuevo ID de usuario generado', 'success');
    }

    async generateInitialMessage() {
        try {
            // Show typing indicator
            this.showTypingIndicator();

            // Create a personalized initial prompt based on context
            let initialPrompt = "Genera un mensaje de bienvenida personalizado y breve. Saluda al usuario de manera amigable y personalizada, presentándote brevemente e invitándolo a comenzar la conversación. El mensaje debe ser conciso y motivador. EL USUARIO NO TIENE NOMBRE A MENOS QUE SE LE INDIQUE.";

            const response = await this.generateResponse(initialPrompt);
            this.addMessage(response, 'bot');
            this.hideTypingIndicator();
        } catch (error) {
            console.error('Error generating initial message:', error);
            // Fallback message if AI fails
            this.hideTypingIndicator();
            this.addMessage("¡Hola! Soy Chatcito-Jada, tu asistente inteligente. ¿En qué puedo ayudarte hoy?", 'bot');
        }
    }

    async generateResponse(userMessage) {

        const context = this.context;

        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                context,
                "chatinput": userMessage,
                "userId": this.userId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate response');
        }

        const r = await response.json()

        return r.output;
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message flex space-x-2 sm:space-x-3 mb-4 sm:mb-6';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 text-white rounded-full flex items-center justify-center';
        avatar.innerHTML = '<i class="fas fa-robot text-sm sm:text-base"></i>';

        const messageContent = document.createElement('div');
        messageContent.className = 'flex-1 bg-white p-3 sm:p-4 rounded-lg border border-gray-200';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'flex space-x-1';
        typingIndicator.innerHTML = `
            <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        `;

        messageContent.appendChild(typingIndicator);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(messageContent);
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setupAutoResize() {
        const textarea = document.getElementById('chat-input');
        textarea.addEventListener('input', () => this.autoResize(textarea));
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Context Management
    saveContext() {
        this.context = {
            personality: document.getElementById('ai-personality').value,
            knowledge: document.getElementById('ai-knowledge').value,
            instructions: document.getElementById('ai-instructions').value,
            examples: document.getElementById('ai-examples').value
        };

        localStorage.setItem('chatcito-jada-context', JSON.stringify(this.context));

        // Show success message
        this.showNotification('Contexto guardado exitosamente', 'success');

        // Update preview
        this.updatePreview();
    }

    loadContext() {
        const saved = localStorage.getItem('chatcito-jada-context');
        if (saved) {
            this.context = JSON.parse(saved);

            // Populate form fields
            document.getElementById('ai-personality').value = this.context.personality;
            document.getElementById('ai-knowledge').value = this.context.knowledge;
            document.getElementById('ai-instructions').value = this.context.instructions;
            document.getElementById('ai-examples').value = this.context.examples;

            this.updatePreview();
        }
    }

    resetContext() {
        if (confirm('¿Estás seguro de que quieres restablecer el contexto? Esta acción no se puede deshacer.')) {
            this.context = {
                personality: 'Eres un asistente de reclutamiento optimista y motivador',
                knowledge: 'Eres un experto en reclutamiento y tienes un amplio conocimiento de las mejores prácticas de reclutamiento',
                instructions: 'Siempre debes ser optimista y motivador. Consigue el nombre del candidato y sus datos personales. No puedes salirte del tema.',
                examples: ''
            };

            // Clear form fields
            document.getElementById('ai-personality').value = this.context.personality;
            document.getElementById('ai-knowledge').value = this.context.knowledge;
            document.getElementById('ai-instructions').value = this.context.instructions;
            document.getElementById('ai-examples').value = this.context.examples;

            // Clear localStorage
            localStorage.removeItem('chatcito-jada-context');

            // Update preview
            this.updatePreview();

            this.showNotification('Contexto restablecido', 'info');
        }
    }

    updatePreview() {
        const previewContent = document.getElementById('context-preview-content');
        const preview = previewContent.querySelector('.preview-placeholder');

        const hasContent = Object.values(this.context).some(value => value.trim() !== '');

        if (hasContent) {
            if (preview) preview.remove();

            let previewHTML = '<div class="space-y-4">';

            if (this.context.personality) {
                previewHTML += `
                    <div class="bg-white p-4 rounded-lg border-l-4 border-primary-500">
                        <h4 class="flex items-center space-x-2 text-sm font-semibold text-gray-900 mb-2">
                            <i class="fas fa-user"></i>
                            <span>Personalidad</span>
                        </h4>
                        <p class="text-sm text-gray-700">${this.context.personality}</p>
                    </div>
                `;
            }

            if (this.context.knowledge) {
                previewHTML += `
                    <div class="bg-white p-4 rounded-lg border-l-4 border-primary-500">
                        <h4 class="flex items-center space-x-2 text-sm font-semibold text-gray-900 mb-2">
                            <i class="fas fa-brain"></i>
                            <span>Conocimiento</span>
                        </h4>
                        <p class="text-sm text-gray-700">${this.context.knowledge}</p>
                    </div>
                `;
            }

            if (this.context.instructions) {
                previewHTML += `
                    <div class="bg-white p-4 rounded-lg border-l-4 border-primary-500">
                        <h4 class="flex items-center space-x-2 text-sm font-semibold text-gray-900 mb-2">
                            <i class="fas fa-list"></i>
                            <span>Instrucciones</span>
                        </h4>
                        <p class="text-sm text-gray-700">${this.context.instructions}</p>
                    </div>
                `;
            }

            if (this.context.examples) {
                previewHTML += `
                    <div class="bg-white p-4 rounded-lg border-l-4 border-primary-500">
                        <h4 class="flex items-center space-x-2 text-sm font-semibold text-gray-900 mb-2">
                            <i class="fas fa-lightbulb"></i>
                            <span>Ejemplos</span>
                        </h4>
                        <p class="text-sm text-gray-700">${this.context.examples}</p>
                    </div>
                `;
            }

            previewHTML += '</div>';
            previewContent.innerHTML = previewHTML;
            previewContent.classList.remove('bg-gray-50', 'border-dashed', 'border-gray-300');
            previewContent.classList.add('bg-white', 'border', 'border-gray-200');
        } else {
            previewContent.innerHTML = '<p class="text-gray-500 italic text-center mt-8">El contexto configurado aparecerá aquí...</p>';
            previewContent.classList.remove('bg-white', 'border', 'border-gray-200');
            previewContent.classList.add('bg-gray-50', 'border-2', 'border-dashed', 'border-gray-300');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-primary-500';
        notification.className = `fixed top-5 right-5 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm transform translate-x-full transition-transform duration-200`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span class="text-sm">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 200);
        }, 3000);
    }
}



// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatcitoJada();
});
