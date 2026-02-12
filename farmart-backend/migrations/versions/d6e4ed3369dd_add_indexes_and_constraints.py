"""Add indexes and constraints

Revision ID: d6e4ed3369dd
Revises: bdf55e21a6a7
Create Date: 2026-02-06 09:36:27.966914

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6e4ed3369dd'
down_revision: Union[str, None] = 'bdf55e21a6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # ---------- USERS ----------
    op.create_unique_constraint(
        "uq_users_email",
        "users",
        ["email"]
    )

    # ---------- ANIMALS ----------
    op.create_index("ix_animals_type", "animals", ["type"])
    op.create_index("ix_animals_breed", "animals", ["breed"])
    op.create_index("ix_animals_age", "animals", ["age"])
    op.create_index("ix_animals_available", "animals", ["available"])
    op.create_index("ix_animals_type_breed", "animals", ["type", "breed"])

    # ---------- CART ITEMS ----------
    op.create_unique_constraint(
        "uq_cart_animal",
        "cart_items",
        ["cart_id", "animal_id"]
    )

    # ---------- ORDER ITEMS ----------
    op.create_unique_constraint(
        "uq_order_animal",
        "order_items",
        ["order_id", "animal_id"]
    )

    # ---------- ORDERS ----------
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_index("ix_orders_paid", "orders", ["paid"])


def downgrade():
    op.drop_index("ix_orders_paid", table_name="orders")
    op.drop_index("ix_orders_status", table_name="orders")
    op.drop_index("ix_orders_user_id", table_name="orders")

    op.drop_constraint("uq_order_animal", "order_items", type_="unique")

    op.drop_constraint("uq_cart_animal", "cart_items", type_="unique")

    op.drop_index("ix_animals_type_breed", table_name="animals")
    op.drop_index("ix_animals_available", table_name="animals")
    op.drop_index("ix_animals_age", table_name="animals")
    op.drop_index("ix_animals_breed", table_name="animals")
    op.drop_index("ix_animals_type", table_name="animals")

    op.drop_constraint("uq_users_email", "users", type_="unique")
