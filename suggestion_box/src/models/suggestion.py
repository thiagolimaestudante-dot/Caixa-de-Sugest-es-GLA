from src.models.user import db
from datetime import datetime

class Suggestion(db.Model):
    __tablename__ = 'sugestoes'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    como_fazer = db.Column(db.Text, nullable=True)
    nome_colaborador = db.Column(db.String(100), nullable=True)
    setor_colaborador = db.Column(db.String(100), nullable=True)
    anonimo = db.Column(db.Boolean, default=False, nullable=False)
    votos = db.Column(db.Integer, default=0, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relacionamento com comentários
    comentarios = db.relationship('Comment', backref='sugestao', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Suggestion {self.titulo}>'

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'como_fazer': self.como_fazer,
            'nome_colaborador': self.nome_colaborador if not self.anonimo else None,
            'setor_colaborador': self.setor_colaborador if not self.anonimo else None,
            'anonimo': self.anonimo,
            'votos': self.votos,
            'data_criacao': self.data_criacao.isoformat(),
            'comentarios': [comentario.to_dict() for comentario in self.comentarios]
        }


class Comment(db.Model):
    __tablename__ = 'comentarios'
    
    id = db.Column(db.Integer, primary_key=True)
    sugestao_id = db.Column(db.Integer, db.ForeignKey('sugestoes.id'), nullable=False)
    nome_comentador = db.Column(db.String(100), nullable=False)
    texto_comentario = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<Comment {self.nome_comentador}>'

    def to_dict(self):
        return {
            'id': self.id,
            'sugestao_id': self.sugestao_id,
            'nome_comentador': self.nome_comentador,
            'texto_comentario': self.texto_comentario,
            'data_criacao': self.data_criacao.isoformat()
        }

