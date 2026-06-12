"""add favorite_note table

Revision ID: c5d6e7f8a9b0
Revises: 461111b60977
Create Date: 2026-06-12 07:30:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c5d6e7f8a9b0'
down_revision: Union[str, None] = '461111b60977'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())

    if 'favorite_note' not in existing_tables:
        op.create_table(
            'favorite_note',
            sa.Column('id', sa.Text(), nullable=False),
            sa.Column('user_id', sa.Text(), nullable=False),
            sa.Column('note_id', sa.Text(), sa.ForeignKey('note.id', ondelete='CASCADE'), nullable=False),
            sa.Column('created_at', sa.BigInteger(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id', 'note_id', name='uq_favorite_note'),
        )


def downgrade() -> None:
    op.drop_table('favorite_note')
