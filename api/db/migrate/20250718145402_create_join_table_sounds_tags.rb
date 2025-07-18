class CreateJoinTableSoundsTags < ActiveRecord::Migration[8.0]
  def change
    create_join_table :sounds, :tags do |t|
      t.index [:sound_id, :tag_id], unique: true
    end
  end
end
