class AddCascadeDelete < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key "folders", "users"
    remove_foreign_key "folders_sounds", "folders"
    remove_foreign_key "folders_sounds", "sounds"
    remove_foreign_key "sounds", "users"

    add_foreign_key "folders", "users", on_delete: :cascade
    add_foreign_key "folders_sounds", "folders", on_delete: :cascade
    add_foreign_key "folders_sounds", "sounds", on_delete: :cascade
    add_foreign_key "sounds", "users", on_delete: :cascade
  end
end
