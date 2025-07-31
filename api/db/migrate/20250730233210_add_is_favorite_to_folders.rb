class AddIsFavoriteToFolders < ActiveRecord::Migration[8.0]
  def change
    add_column :folders, :is_favorite, :boolean, default: false, null: false

    add_index :folders, [ :user_id ], unique: true, where: "is_favorite", name: "index_favorite_folders_unique_per_user"
  end
end
