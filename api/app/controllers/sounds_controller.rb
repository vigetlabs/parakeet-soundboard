class SoundsController < ApplicationController
  before_action :set_sound, only: [ :show, :update, :destroy ]

  def index
    sounds = Sound.all
    render json: SoundSerializer.new(sounds).serializable_hash.to_json
  end

  def show
    render json: SoundSerializer.new(@sound).serializable_hash.to_json
  end

  def create
    sound = Sound.new(sound_params)
    sound.audio_file.attach(sound_params[:audio_file])
    sound.tag_ids = sound_params[:tag_ids] if sound_params[:tag_ids]
    if sound.save
      render json: SoundSerializer.new(sound).serializable_hash.to_json, status: :created
    else
      render json: { errors: sound.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @sound.update(sound_params)
      render json: SoundSerializer.new(@sound).serializable_hash.to_json
    else
      render json: { errors: @sound.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @sound.destroy
    head :no_content
  end

  private

  def set_sound
    @sound = Sound.find(params[:id])
  end

  def sound_params
    params.require(:sound).permit(:name, :audio_file, tag_ids: [])
  end
end
