class AddNeedsUsernameToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :needs_username, :boolean, default: false, null: false
  end
end
