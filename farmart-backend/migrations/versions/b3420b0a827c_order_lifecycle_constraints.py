"""Order lifecycle constraints

Revision ID: b3420b0a827c
Revises: d6e4ed3369dd
Create Date: 2026-02-07 15:19:30.466142

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3420b0a827c'
down_revision: Union[str, None] = 'd6e4ed3369dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Paid orders must be confirmed
    op.create_check_constraint(
        "ck_paid_requires_confirmed",
        "orders",
        "(paid = FALSE) OR (status = 'CONFIRMED')"
    )

    # Rejected orders can never be paid
    op.create_check_constraint(
        "ck_rejected_not_paid",
        "orders",
        "NOT (status = 'REJECTED' AND paid = TRUE)"
    )


def downgrade():
    op.drop_constraint("ck_rejected_not_paid", "orders", type_="check")
    op.drop_constraint("ck_paid_requires_confirmed", "orders", type_="check")

