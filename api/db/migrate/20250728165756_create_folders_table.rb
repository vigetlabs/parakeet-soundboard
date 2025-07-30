class CreateFoldersTable < ActiveRecord::Migration[8.0]
  def change
    create_table :folders do |t|
      t.string :name, null: false
      t.references :user, foreign_key: true, null: true
      t.timestamps
    end
  end
end
