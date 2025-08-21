from flask import Blueprint, request, jsonify
from src.models.suggestion import db, Suggestion, Comment
from flask_cors import cross_origin

suggestion_bp = Blueprint('suggestion', __name__)

@suggestion_bp.route('/suggestions', methods=['GET'])
@cross_origin()
def get_suggestions():
    """Obter todas as sugestões"""
    try:
        suggestions = Suggestion.query.order_by(Suggestion.data_criacao.desc()).all()
        return jsonify([suggestion.to_dict() for suggestion in suggestions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suggestion_bp.route('/suggestions', methods=['POST'])
@cross_origin()
def create_suggestion():
    """Criar uma nova sugestão"""
    try:
        data = request.get_json()
        
        if not data or not data.get('titulo') or not data.get('descricao'):
            return jsonify({'error': 'Título e descrição são obrigatórios'}), 400
        
        # Verificar se é anônimo
        anonimo = data.get('anonimo', False)
        
        suggestion = Suggestion(
            titulo=data['titulo'],
            descricao=data['descricao'],
            como_fazer=data.get('como_fazer', ''),
            nome_colaborador=data.get('nome_colaborador') if not anonimo else None,
            setor_colaborador=data.get('setor_colaborador') if not anonimo else None,
            anonimo=anonimo
        )
        
        db.session.add(suggestion)
        db.session.commit()
        
        return jsonify(suggestion.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@suggestion_bp.route('/suggestions/<int:suggestion_id>/vote', methods=['POST'])
@cross_origin()
def vote_suggestion(suggestion_id):
    """Votar em uma sugestão"""
    try:
        suggestion = Suggestion.query.get_or_404(suggestion_id)
        suggestion.votos += 1
        db.session.commit()
        
        return jsonify(suggestion.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@suggestion_bp.route('/suggestions/<int:suggestion_id>/comments', methods=['POST'])
@cross_origin()
def add_comment(suggestion_id):
    """Adicionar comentário a uma sugestão"""
    try:
        data = request.get_json()
        
        if not data or not data.get('nome_comentador') or not data.get('texto_comentario'):
            return jsonify({'error': 'Nome do comentador e texto do comentário são obrigatórios'}), 400
        
        # Verificar se a sugestão existe
        suggestion = Suggestion.query.get_or_404(suggestion_id)
        
        comment = Comment(
            sugestao_id=suggestion_id,
            nome_comentador=data['nome_comentador'],
            texto_comentario=data['texto_comentario']
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify(comment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@suggestion_bp.route('/suggestions/ranking', methods=['GET'])
@cross_origin()
def get_ranking():
    """Obter ranking das sugestões mais votadas"""
    try:
        suggestions = Suggestion.query.order_by(Suggestion.votos.desc()).limit(10).all()
        return jsonify([suggestion.to_dict() for suggestion in suggestions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

