class AddColorToTags < ActiveRecord::Migration[8.0]
  def change
    add_column :tags, :color, :string, null: true
  end
end
