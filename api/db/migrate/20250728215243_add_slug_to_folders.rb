class AddSlugToFolders < ActiveRecord::Migration[8.0]
  def change
    add_column :folders, :slug, :string, null: false
    add_index :folders, :slug, unique: true
  end
end
