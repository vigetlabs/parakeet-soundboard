class TagsController < ApplicationController
  def index
    tags = Tag.all
    render json: TagSerializer.new(tags).serializable_hash.to_json
  end

  def show
    render json: TagSerializer.new(tag).serializable_hash.to_json
  end

  def create
    tag = Tag.new(tag_params)
    if tag.save
      render json: TagSerializer.new(tag).serializable_hash.to_json, status: :created
    else
      render json: { errors: tag.errors }, status: :unprocessable_entity
    end
  end

  def update
    if tag.update(tag_params)
      render json: TagSerializer.new(tag).serializable_hash.to_json
    else
      render json: { errors: tag.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    tag.destroy
    head :no_content
  end

  private

  def tag
    @tag ||= Tag.find(params[:id])
  end

  def tag_params
    params.require(:tag).permit(:name, :color)
  end
end
