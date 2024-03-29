"""empty message

Revision ID: bb41350882b0
Revises: 1a55b7674144
Create Date: 2024-02-06 21:50:12.510525

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bb41350882b0'
down_revision = 'bc8ad1f790b5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('application', sa.Column('submission_display_name', sa.String(length=255), nullable=True))    
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###  
    op.drop_column('application', 'submission_display_name')
    # ### end Alembic commands ###