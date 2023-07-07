const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware");
const { Posts, Users, Likes } = require("../models");
const { Op } = require("sequelize");

// 게시글 좋아요 API
// 12. 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 게시글 좋아요 가능
router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const findUser = await Users.findOne({
    where: {
      userId: userId,
    },
  });
  const findPost = await Posts.findOne({
    where: {
      postId: postId,
    },
  });
  // Likes 테이블 안에 전달받은 PostId와 UserId와 일치하는 자료가 존재하는지 확인.
  const existLike = await Likes.findOne({
    where: {
      PostId: postId,
      UserId: userId,
    },
  });

  if (findUser.length <= 0) {
    return res
      .status(403)
      .json({ errorMessage: "로그인이 필요한 기능입니다." });
  }
  if (findPost.length <= 0) {
    return res
      .status(404)
      .json({ errorMessage: "게시글이 존재하지 않습니다." });
  }
  // existLike에 자료가 존재하지 않는다면 Likes 데이터베이스에 PostId와 UserId를 생성한다.
  if (!existLike) {
    await Likes.create({ PostId: postId, UserId: userId });
    return res.status(200).json({ message: "게시글에 좋아요를 등록했습니다." });
  } else {
    await Likes.destroy({
      where: { PostId: postId, UserId: userId },
    });
    return res
      .status(200)
      .json({ message: "게시글의 좋아요를 취소하였습니다." });
  }
});

module.exports = router;
