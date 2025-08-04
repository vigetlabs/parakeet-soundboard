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
  { name: 'Airhorn', file_path: 'airhorn.mp3', tags: [ "Funny", "Sharp", "Meme", "Celebration" ], color: "#e90c13", emoji: "🔉" },
  { name: 'Anime Wow', file_path: 'anime-wow.mp3', tags: [ "Positive", "Funny", "Cute", "Voice", "Meme" ], color: "#ff4bd8", emoji: "🎉" },
  { name: 'Applause', file_path: 'applause.mp3', tags: [ "Positive", "Crowd", "Classic", "Celebration" ], color: "#bb27ff", emoji: "👏" },
  { name: 'Background Music', file_path: 'bg-music.mp3', tags: [ "Positive", "Smooth", "Musical", "Electronic", "Celebration" ], color: "#5373f2", emoji: "🎵" },
  { name: 'Crickets', file_path: 'crickets.mp3', tags: [ "Negative", "Gentle", "Nature", "Animal" ], color: "#ff6e42", emoji: "🦗" },
  { name: 'Drumroll', file_path: 'drumroll.mp3', tags: [ "Impact", "Classic", "Celebration" ], color: "#ffc53d", emoji: "🥁" },
  { name: 'Explosion', file_path: 'explosion.mp3', tags: [ "Funny", "Sharp", "Impact" ], color: "#008573", emoji: "💥" },
  { name: 'Splat', file_path: 'splat.mp3', tags: [ "Funny", "Smooth", "Meme" ], color: "#6200ad", emoji: "♠️" },
  { name: 'Quack', file_path: 'quack.mp3', tags: [ "Funny", "Animal", "Meme" ], color: "#00d5b8", emoji: "🦆" },
  { name: 'Yippee', file_path: 'yippee.mp3', tags: [ "Positive", "Funny", "Cute", "Voice", "Meme", "Celebration" ], color: "#00c8ff", emoji: "🏳️‍🌈" }
]

default_tags = [
  { name: 'Negative' },
  { name: 'Positive' },
  { name: 'Funny' },
  { name: 'Scary' },
  { name: 'Cute' },
  { name: 'Sad' },
  { name: 'Gentle' },
  { name: 'Sharp' },
  { name: 'Smooth' },
  { name: 'Impact' },
  { name: 'Voice' },
  { name: 'Musical' },
  { name: 'Electronic' },
  { name: 'Nature' },
  { name: 'Animal' },
  { name: 'Crowd' },
  { name: 'Retro' },
  { name: 'Classic' },
  { name: 'Meme' },
  { name: 'Celebration' },
  { name: 'Holiday' }
]

tag_records = default_tags.map { |t| [ t[:name], Tag.find_or_create_by!(name: t[:name]) ] }.to_h

sound_records = default_sounds.map do |sound|
  s = Sound.find_or_create_by!(name: sound[:name], color: sound[:color], emoji: sound[:emoji]) do |snd|
    snd.audio_file.attach(io: File.open(Rails.root.join("db", "seeds", "audio", sound[:file_path])), filename: sound[:file_path])
  end

  # Associate tags
  sound[:tags].each do |tag_name|
    s.tags << tag_records[tag_name] unless s.tags.include?(tag_records[tag_name])
  end

  [ sound[:name], s ]
end.to_h

favorites_folder = Folder.find_or_create_by!(name: "Favorites")
jokes_folder = Folder.find_or_create_by!(name: "Jokes")
dnd_folder = Folder.find_or_create_by!(name: "Dungeons & Dragons")
misc_folder = Folder.find_or_create_by!(name: "Misc")

favorites_sounds = [ 'Explosion', 'Quack', 'Drumroll', 'Yippee', 'Background Music' ]
jokes_sounds = [ 'Airhorn', 'Anime Wow' ]
misc_sounds = [ 'Crickets', 'Drumroll', 'Background Music' ]

favorites_sounds.each do |sound_name|
  sound = sound_records[sound_name]
  favorites_folder.sounds << sound unless favorites_folder.sounds.include?(sound)
end

jokes_sounds.each do |sound_name|
  sound = sound_records[sound_name]
  jokes_folder.sounds << sound unless jokes_folder.sounds.include?(sound)
end

misc_sounds.each do |sound_name|
  sound = sound_records[sound_name]
  misc_folder.sounds << sound unless misc_folder.sounds.include?(sound)
end
