class ScopeFolderSlugToUser < ActiveRecord::Migration[8.0]
  def change
    remove_index :folders, :slug
    add_index :folders, [:user_id, :slug], unique: true
  end
end
