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
  { name: 'Anime Wow', file_path: 'anime-wow.mp3', tags: [ "Positive", "Funny", "Cute", "Voice", "Meme" ], color: "#ff4bd8", emoji: "🤩" },
  { name: 'Applause', file_path: 'applause.mp3', tags: [ "Positive", "Crowd", "Celebration" ], color: "#bb27ff", emoji: "👏" },
  { name: 'Bird Purr', file_path: 'bird-purr.mp3', tags: [ "Positive", "Gentle", "Nature", "Animal", "Tommy", "Voice" ], color: "#5373f2", emoji: "🐦" },
  { name: 'Bird Whistle', file_path: 'bird-whistle.mp3', tags: [ "Positive", "Gentle", "Nature", "Animal", "Tommy", "Voice" ], color: "#008573", emoji: "🐦‍⬛" },
  { name: 'Crickets', file_path: 'crickets.mp3', tags: [ "Negative", "Gentle", "Nature", "Animal" ], color: "#ff6e42", emoji: "🦗" },
  { name: 'Drumroll', file_path: 'drumroll.mp3', tags: [ "Impact", "Celebration" ], color: "#ffc53d", emoji: "🥁" },
  { name: 'Explosion', file_path: 'explosion.mp3', tags: [ "Funny", "Sharp", "Impact" ], color: "#008573", emoji: "💥" },
  { name: 'FLF Yay', file_path: 'flf-yay.mp3', tags: [ "Positive", "Funny", "Cute", "Voice", "Meme", "Celebration", "Tommy" ], color: "#ff6e42", emoji: "🥳" },
  { name: 'Friday', file_path: 'happy-friday.mp3', tags: ["Positive", "Voice", "Celebration"], color: "#ff4bd8", emoji: "🏝️"},
  { name: 'Guuurl', file_path: 'guuurl.mp3', tags: ["Funny", "Meme", "Negative", "Smooth", "Voice", "Tommy"], color: "#00c8ff", emoji: "🤦‍♀️" },
  { name: 'Like Seriously', file_path: 'like-seriously.mp3', tags: [ "Negative", "Funny", "Voice", "Meme", "Tommy" ], color: "#6200ad", emoji: "😑" },
  { name: 'Music', file_path: 'music.mp3', tags: [ "Positive", "Musical", "Celebration", "Meme", "Electronic" ], color: "#5373f2", emoji: "🎵" },
  { name: 'Muted', file_path: 'uh-i-think-youre-muted.mp3', tags: ["Voice", "Tommy"], color: "#e90c13", emoji: "👂"},
  { name: 'Quack', file_path: 'quack.mp3', tags: [ "Funny", "Animal", "Meme" ], color: "#00d5b8", emoji: "🦆" },
  { name: 'Screenshare', file_path: 'screenshare.mp3', tags: [ "Negative", "Funny", "Voice", "Meme", "Tommy" ], color: "#bb27ff", emoji: "🖥️" },
  { name: 'Splat', file_path: 'splat.mp3', tags: [ "Funny", "Smooth", "Meme" ], color: "#e90c13", emoji: "♠️" },
  { name: 'Tada', file_path: 'tada.mp3', tags: [ "Positive", "Funny", "Cute", "Voice", "Meme", "Celebration", "Tommy" ], color: "#ffc53d", emoji: "🎉" },
  { name: 'TTT', file_path: 'its-ttt-yall.mp3', tags: ["Positive", "Celebration", "Funny", "Voice", "Tommy"], color: "#008573", emoji: "🤠"},
  { name: 'Vigét', file_path: 'viget.mp3', tags: [ "Negative", "Funny", "Voice", "Meme", "Tommy" ], color: "#00d5b8", emoji: "🥖" },
  { name: 'Womp', file_path: 'womp-womp-waaamp.mp3', tags: ["Negative", "Sad", "Funny", "Musical", "Meme", "Voice", "Tommy"], color: "#6200ad", emoji: "🫠"},
  { name: "Yas Queen", file_path: 'yas-queen.mp3', tags: [ "Positive", "Funny", "Cute", "Voice", "Meme", "Celebration", "Tommy" ], color: "#ff4bd8", emoji: "💅" },
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
  { name: 'Meme' },
  { name: 'Celebration' },
  { name: 'Holiday' },
  { name: 'Tommy' }
]

tag_records = default_tags.map { |t| [ t[:name], Tag.find_or_create_by!(name: t[:name]) ] }.to_h

default_sounds.map do |sound|
  s = Sound.find_or_create_by!(name: sound[:name], color: sound[:color], emoji: sound[:emoji]) do |snd|
    snd.audio_file.attach(io: File.open(Rails.root.join("db", "seeds", "audio", sound[:file_path])), filename: sound[:file_path])
  end

  # Associate tags
  sound[:tags].each do |tag_name|
    s.tags << tag_records[tag_name] unless s.tags.include?(tag_records[tag_name])
  end

  [ sound[:name], s ]
end.to_h
