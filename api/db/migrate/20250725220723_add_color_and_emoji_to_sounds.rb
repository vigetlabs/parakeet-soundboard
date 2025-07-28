class AddColorAndEmojiToSounds < ActiveRecord::Migration[8.0]
  def change
    add_column :sounds, :color, :string, null: true
    add_column :sounds, :emoji, :string, null: true
  end
end
