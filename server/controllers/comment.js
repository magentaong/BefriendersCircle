async function getComments(Comment) {
    try{ 
        const comments = await Comment.find(); 
    return comments 
    } catch (err) {
        const error = new Error("Failed to fetch comment")
        error.status = 404;
        throw error
    }
}

async function createComment(Comment, commentData){
    try{
        const newComment = new Comment(commentData);
        await newComment.save();
        return newComment
    } catch (err) {
        const error = new Error("Failed to fetch comment");
        error.status = 400;
        throw error
    }
}

async function getCommentFromPost(Comment, pID){
    try{
        const comment = await Comment.find({pID});
        return comment
    } catch (err) {
        const error = new Error("Failed to fetch board");
        error.status = 500;
        throw error
    }
}


module.exports = {getComments, createComment, getCommentFromPost}