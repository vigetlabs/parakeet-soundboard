class AddUserToSounds < ActiveRecord::Migration[8.0]
  def change
    add_reference :sounds, :user, null: true, foreign_key: true
  end
end
