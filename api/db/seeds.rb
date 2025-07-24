# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

default_sounds = [
  { name: 'Airhorn', file_path: 'airhorn.mp3' },
  { name: 'Anime Wow', file_path: 'anime-wow.mp3' },
  { name: 'Applause', file_path: 'applause.mp3' },
  { name: 'Background Music', file_path: 'bg-music.mp3' },
  { name: 'Crickets', file_path: 'crickets.mp3' },
  { name: 'Drumroll', file_path: 'drumroll.mp3' },
  { name: 'Explosion', file_path: 'explosion.mp3' },
  { name: 'Quack', file_path: 'quack.mp3' },
  { name: 'Splat', file_path: 'splat.mp3' },
  { name: 'Yippee', file_path: 'yippee.mp3' }
]

default_sounds.each do |sound|
  Sound.find_or_create_by!(name: sound[:name]) do |s|
    s.audio_file.attach(io: File.open(Rails.root.join("db", "seeds", "audio", sound[:file_path])), filename: sound[:file_path])
  end
end
