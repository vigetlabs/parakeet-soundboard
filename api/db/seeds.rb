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
  { name: 'Airhorn', file_path: 'airhorn.mp3', tags: [ 'Funny' ] },
  { name: 'Anime Wow', file_path: 'anime-wow.mp3', tags: [ 'Funny', 'Positive' ] },
  { name: 'Applause', file_path: 'applause.mp3', tags: [ 'Positive' ] },
  { name: 'Background Music', file_path: 'bg-music.mp3', tags: [ 'Positive' ] },
  { name: 'Crickets', file_path: 'crickets.mp3', tags: [ 'Funny' ] },
  { name: 'Drumroll', file_path: 'drumroll.mp3', tags: [ 'Funny' ] },
  { name: 'Explosion', file_path: 'explosion.mp3', tags: [ 'Funny' ] },
  { name: 'Quack', file_path: 'quack.mp3', tags: [ 'Funny' ] },
  { name: 'Splat', file_path: 'splat.mp3', tags: [ 'Funny' ] },
  { name: 'Yippee', file_path: 'yippee.mp3', tags: [ 'Funny', 'Positive' ] }
]

default_tags = [
  { name: 'Funny' },
  { name: 'Positive' }
]

tag_records = default_tags.map { |t| [ t[:name], Tag.find_or_create_by!(name: t[:name]) ] }.to_h

sound_records = default_sounds.map do |sound|
  s = Sound.find_or_create_by!(name: sound[:name]) do |snd|
    snd.audio_file.attach(io: File.open(Rails.root.join("db", "seeds", "audio", sound[:file_path])), filename: sound[:file_path])
  end

  # Associate tags
  sound[:tags].each do |tag_name|
    s.tags << tag_records[tag_name] unless s.tags.include?(tag_records[tag_name])
  end

  [ sound[:name], s ]
end.to_h

demo_folder = Folder.find_or_create_by!(name: "For Demo")

demo_sounds = [ 'Anime Wow', 'Yippee', 'Airhorn', 'Background Music', 'Crickets' ]
demo_sounds.each do |sound_name|
  sound = sound_records[sound_name]
  demo_folder.sounds << sound unless demo_folder.sounds.include?(sound)
end
