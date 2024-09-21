"""Initial migration

Revision ID: 575a7bc1c2a3
Revises: 
Create Date: 2024-09-22 00:20:15.195944

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '575a7bc1c2a3'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('chat_messages', 'message',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               existing_nullable=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('chat_messages', 'message',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               existing_nullable=True)
    # ### end Alembic commands ###