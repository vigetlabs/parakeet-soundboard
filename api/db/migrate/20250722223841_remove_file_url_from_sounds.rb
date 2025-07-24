class RemoveFileUrlFromSounds < ActiveRecord::Migration[8.0]
  def change
    remove_column :sounds, :file_url, :string
  end
end
