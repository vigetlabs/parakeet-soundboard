class CreateSounds < ActiveRecord::Migration[8.0]
  def change
    create_table :sounds do |t|
      t.string :name, null: false
      t.string :file_url, null: false

      t.timestamps
    end
  end
end
