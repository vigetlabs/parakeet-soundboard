class CreateJoinTableFoldersSounds < ActiveRecord::Migration[8.0]
  def change
    create_table :folders_sounds, id: false do |t|
      t.references :folder, null: false, foreign_key: true
      t.references :sound, null: false, foreign_key: true
    end

    add_index :folders_sounds, [ :folder_id, :sound_id ], unique: true
  end
end
