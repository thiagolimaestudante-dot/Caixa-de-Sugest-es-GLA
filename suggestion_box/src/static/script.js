// Configuração da API
const API_BASE_URL = '/api';

// Estado global
let currentSuggestionId = null;
let suggestions = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadSuggestions();
    setupTabNavigation();
}

// Event Listeners
function setupEventListeners() {
    // Formulário de sugestão
    document.getElementById('suggestion-form').addEventListener('submit', handleSuggestionSubmit);
    
    // Checkbox anônimo
    document.getElementById('anonimo').addEventListener('change', toggleIdentificationFields);
    
    // Formulário de comentário
    document.getElementById('comment-form').addEventListener('submit', handleCommentSubmit);
    
    // Fechar modal ao clicar fora
    document.getElementById('comments-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCommentsModal();
        }
    });
}

// Navegação por abas
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remover classe active de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active na aba clicada
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Carregar dados específicos da aba
            if (targetTab === 'visualizar') {
                loadSuggestions();
            } else if (targetTab === 'ranking') {
                loadRanking();
            }
        });
    });
}

// Toggle campos de identificação
function toggleIdentificationFields() {
    const isAnonymous = document.getElementById('anonimo').checked;
    const identificationFields = document.getElementById('identificacao-fields');
    const nomeInput = document.getElementById('nome');
    const setorInput = document.getElementById('setor');
    
    if (isAnonymous) {
        identificationFields.classList.add('hidden');
        nomeInput.value = '';
        setorInput.value = '';
        nomeInput.removeAttribute('required');
        setorInput.removeAttribute('required');
    } else {
        identificationFields.classList.remove('hidden');
        nomeInput.setAttribute('required', 'required');
        setorInput.setAttribute('required', 'required');
    }
}

// Envio de sugestão
async function handleSuggestionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const isAnonymous = document.getElementById('anonimo').checked;
    
    const suggestionData = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        como_fazer: document.getElementById('como-fazer').value,
        anonimo: isAnonymous,
        nome_colaborador: isAnonymous ? null : document.getElementById('nome').value,
        setor_colaborador: isAnonymous ? null : document.getElementById('setor').value
    };
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/suggestions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(suggestionData)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao enviar sugestão');
        }
        
        const result = await response.json();
        
        showToast('Sugestão enviada com sucesso!', 'success');
        
        // Limpar formulário
        e.target.reset();
        toggleIdentificationFields();
        
        // Recarregar sugestões se estiver na aba de visualização
        if (document.querySelector('.nav-tab[data-tab="visualizar"]').classList.contains('active')) {
            loadSuggestions();
        }
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao enviar sugestão. Tente novamente.', 'error');
    } finally {
        showLoading(false);
    }
}

// Carregar sugestões
async function loadSuggestions() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/suggestions`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar sugestões');
        }
        
        suggestions = await response.json();
        renderSuggestions(suggestions);
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar sugestões', 'error');
        renderEmptyState('suggestions-list', 'Erro ao carregar sugestões');
    } finally {
        showLoading(false);
    }
}

// Renderizar sugestões
function renderSuggestions(suggestions) {
    const container = document.getElementById('suggestions-list');
    const totalElement = document.getElementById('suggestions-total');
    
    totalElement.textContent = suggestions.length;
    
    if (suggestions.length === 0) {
        renderEmptyState('suggestions-list', 'Nenhuma sugestão encontrada', 'Seja o primeiro a enviar uma sugestão!');
        return;
    }
    
    container.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-card">
            <div class="suggestion-header">
                <div>
                    <h3 class="suggestion-title">${escapeHtml(suggestion.titulo)}</h3>
                    <div class="suggestion-meta">
                        ${suggestion.anonimo ? 
                            '<span><i class="fas fa-user-secret"></i> Anônimo</span>' : 
                            `<span><i class="fas fa-user"></i> ${escapeHtml(suggestion.nome_colaborador || 'N/A')}</span>
                             <span><i class="fas fa-building"></i> ${escapeHtml(suggestion.setor_colaborador || 'N/A')}</span>`
                        }
                        <span><i class="fas fa-calendar"></i> ${formatDate(suggestion.data_criacao)}</span>
                    </div>
                </div>
                <div class="suggestion-votes">
                    <i class="fas fa-thumbs-up"></i>
                    ${suggestion.votos}
                </div>
            </div>
            
            <div class="suggestion-description">
                ${escapeHtml(suggestion.descricao)}
            </div>
            
            ${suggestion.como_fazer ? `
                <div class="suggestion-implementation">
                    <h4><i class="fas fa-cogs"></i> Como Implementar:</h4>
                    <p>${escapeHtml(suggestion.como_fazer)}</p>
                </div>
            ` : ''}
            
            <div class="suggestion-actions">
                <button class="btn btn-vote" onclick="voteSuggestion(${suggestion.id})">
                    <i class="fas fa-thumbs-up"></i>
                    Votar
                </button>
                <button class="btn btn-comment" onclick="openCommentsModal(${suggestion.id})">
                    <i class="fas fa-comment"></i>
                    Comentários (${suggestion.comentarios.length})
                </button>
            </div>
        </div>
    `).join('');
}

// Votar em sugestão
async function voteSuggestion(suggestionId) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/suggestions/${suggestionId}/vote`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao votar');
        }
        
        showToast('Voto registrado com sucesso!', 'success');
        
        // Recarregar sugestões
        loadSuggestions();
        
        // Se estiver na aba de ranking, recarregar também
        if (document.querySelector('.nav-tab[data-tab="ranking"]').classList.contains('active')) {
            loadRanking();
        }
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao registrar voto', 'error');
    } finally {
        showLoading(false);
    }
}

// Carregar ranking
async function loadRanking() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/suggestions/ranking`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar ranking');
        }
        
        const ranking = await response.json();
        renderRanking(ranking);
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar ranking', 'error');
        renderEmptyState('ranking-list', 'Erro ao carregar ranking');
    } finally {
        showLoading(false);
    }
}

// Renderizar ranking
function renderRanking(ranking) {
    const container = document.getElementById('ranking-list');
    
    if (ranking.length === 0) {
        renderEmptyState('ranking-list', 'Nenhuma sugestão votada ainda', 'Vote nas sugestões para criar o ranking!');
        return;
    }
    
    container.innerHTML = ranking.map((suggestion, index) => {
        const position = index + 1;
        let positionClass = '';
        
        if (position === 1) positionClass = 'first';
        else if (position === 2) positionClass = 'second';
        else if (position === 3) positionClass = 'third';
        
        return `
            <div class="suggestion-card">
                <div class="suggestion-header">
                    <div style="display: flex; align-items: flex-start; gap: 15px;">
                        <div class="ranking-position ${positionClass}">
                            ${position}
                        </div>
                        <div>
                            <h3 class="suggestion-title">${escapeHtml(suggestion.titulo)}</h3>
                            <div class="suggestion-meta">
                                ${suggestion.anonimo ? 
                                    '<span><i class="fas fa-user-secret"></i> Anônimo</span>' : 
                                    `<span><i class="fas fa-user"></i> ${escapeHtml(suggestion.nome_colaborador || 'N/A')}</span>
                                     <span><i class="fas fa-building"></i> ${escapeHtml(suggestion.setor_colaborador || 'N/A')}</span>`
                                }
                                <span><i class="fas fa-calendar"></i> ${formatDate(suggestion.data_criacao)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="suggestion-votes">
                        <i class="fas fa-thumbs-up"></i>
                        ${suggestion.votos}
                    </div>
                </div>
                
                <div class="suggestion-description">
                    ${escapeHtml(suggestion.descricao)}
                </div>
                
                ${suggestion.como_fazer ? `
                    <div class="suggestion-implementation">
                        <h4><i class="fas fa-cogs"></i> Como Implementar:</h4>
                        <p>${escapeHtml(suggestion.como_fazer)}</p>
                    </div>
                ` : ''}
                
                <div class="suggestion-actions">
                    <button class="btn btn-vote" onclick="voteSuggestion(${suggestion.id})">
                        <i class="fas fa-thumbs-up"></i>
                        Votar
                    </button>
                    <button class="btn btn-comment" onclick="openCommentsModal(${suggestion.id})">
                        <i class="fas fa-comment"></i>
                        Comentários (${suggestion.comentarios.length})
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Modal de comentários
function openCommentsModal(suggestionId) {
    currentSuggestionId = suggestionId;
    const suggestion = suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) {
        showToast('Sugestão não encontrada', 'error');
        return;
    }
    
    // Atualizar título do modal
    document.querySelector('.modal-title').textContent = `Comentários - ${suggestion.titulo}`;
    
    // Renderizar comentários
    renderComments(suggestion.comentarios);
    
    // Mostrar modal
    document.getElementById('comments-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCommentsModal() {
    document.getElementById('comments-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
    currentSuggestionId = null;
    
    // Limpar formulário
    document.getElementById('comment-form').reset();
}

// Renderizar comentários
function renderComments(comments) {
    const container = document.getElementById('comments-list');
    
    if (comments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>Nenhum comentário ainda</h3>
                <p>Seja o primeiro a comentar nesta sugestão!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">
                    <i class="fas fa-user"></i>
                    ${escapeHtml(comment.nome_comentador)}
                </span>
                <span class="comment-date">
                    ${formatDate(comment.data_criacao)}
                </span>
            </div>
            <div class="comment-text">
                ${escapeHtml(comment.texto_comentario)}
            </div>
        </div>
    `).join('');
}

// Envio de comentário
async function handleCommentSubmit(e) {
    e.preventDefault();
    
    if (!currentSuggestionId) {
        showToast('Erro: Sugestão não identificada', 'error');
        return;
    }
    
    const commentData = {
        nome_comentador: document.getElementById('comment-name').value,
        texto_comentario: document.getElementById('comment-text').value
    };
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/suggestions/${currentSuggestionId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao enviar comentário');
        }
        
        showToast('Comentário adicionado com sucesso!', 'success');
        
        // Limpar formulário
        e.target.reset();
        
        // Recarregar sugestões para atualizar contadores
        await loadSuggestions();
        
        // Atualizar comentários no modal
        const suggestion = suggestions.find(s => s.id === currentSuggestionId);
        if (suggestion) {
            renderComments(suggestion.comentarios);
        }
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao enviar comentário', 'error');
    } finally {
        showLoading(false);
    }
}

// Utilitários
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remover toast após 4 segundos
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function renderEmptyState(containerId, title, subtitle = '') {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>${title}</h3>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

