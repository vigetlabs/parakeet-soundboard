class AddOmniauthToUsers < ActiveRecord::Migration[8.0]
  def up
    unless column_exists?(:users, :provider)
      add_column :users, :provider, :string
    end

    unless column_exists?(:users, :uid)
      add_column :users, :uid, :string
    end

    unless index_exists?(:users, [ :provider, :uid ], unique: true)
      add_index :users, [ :provider, :uid ], unique: true
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration,
      "SSO columns may predate this migration; rollback requires manual review"
  end
end
