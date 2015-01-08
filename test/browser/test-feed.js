suite('feed', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);
  suiteSetup(cleanAllPosts);

  test('signIn hommer', function (done) {
    hoodie.account.signIn('Hommer', '123')
      .fail(function (err) {
        done();
        assert.ok(false, err.message);
      })
      .done(function () {
        assert.equal(
          hoodie.account.username,
          'hommer',
          'should be logged in after signup'
        );
        done();
      });
  });

  test('hommer should post', function (done) {
    hoodie.socialmedia.post({text: 'dooh!'})
      .fail(function (err) {
        done((err.message !== 'conflict') ? err: null);
        assert.ok(false, err.message);
      })
      .then(function () {
        assert.ok(true, 'post with success');
        done();
      });
  });

  test('hommer should get post/text feed', function (done) {
    hoodie.socialmedia.feed()
      .fail(done)
      .then(function (feed) {
        this.hommerPost = feed.rows[0];
        done();
        assert.ok(true, 'feed with success');
      }.bind(this));
  });

  test('hommer should edit post', function (done) {
    var hommerPost = this.hommerPost;
    hommerPost.title = 'D\'oh Homer';
    hommerPost.text = 'Hmm... Donuts!';

    hoodie.socialmedia.updatePost(hommerPost)
      .fail(done)
      .then(function () {
        done();
        assert.ok(true, 'post with success');
      });
  });

  test('lisa should post', function (done) {
    signinUser('Lisa', '123', function () {
      hoodie.socialmedia.post({text: 'i m vegan!'})
        .fail(function (err) {
          done((err.message !== 'conflict') ? err: null);
          assert.ok(false, err.message);
        })
        .then(function (post) {
          assert.ok(true, 'post with success');
          done();
        });
    })
  });


  test('lisa should not edit hommer post', function (done) {
    var hommerPost = this.hommerPost;
    hommerPost.title = 'D\'oh Homer';
    hommerPost.text = 'vegan daddy!!';

    hoodie.socialmedia.updatePost(hommerPost)
      .fail(function () {
        done();
        assert.ok(true, 'post should not edit by lisa');
      })
      .then(function () {
        done();
        assert.ok(false, 'post hould edit only by owner');
      });
  });


  test('lisa should not delete hommer post', function (done) {
    var hommerPost = this.hommerPost;

    hoodie.socialmedia.deletePost(hommerPost)
      .fail(function () {
        done();
        assert.ok(true, 'post should not delete by lisa');
      })
      .then(function () {
        done();
        assert.ok(false, 'post hould delete only by owner');
      });
  });

  test('hommer should get 2 post in his feed', function (done) {
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.feed()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (feed) {
          done();
          assert.ok(feed.rows.length == 2, 'feed with success');
        });
    })
  });

  test('hommer should get lisa feed', function (done) {
    hoodie.socialmedia.feed('Lisa')
      .fail(function (err) {
        done(err);
        assert.ok(false, err.message);
      })
      .then(function (feed) {
        this.lisaPost = feed.rows[0];
        done();
        assert.ok(feed.rows.length == 1, 'feed with success');
      }.bind(this));
  });


 test('hommer should not edit lisa post', function (done) {
    var lisaPost = this.lisaPost;
    lisaPost.title = 'Lisaaa';
    lisaPost.text = 'vegan?? chamed!';

    hoodie.socialmedia.updatePost(lisaPost)
      .fail(function () {
        done();
        assert.ok(true, 'post should not edit by hommer');
      })
      .then(function (post) {
        done();
        assert.ok(false, 'post hould edit only by owner');
      });
  });


  test('hommer should not delete lisa post', function (done) {
    var lisaPost = this.lisaPost;

    hoodie.socialmedia.deletePost(lisaPost)
      .fail(function () {
        done();
        assert.ok(true, 'post should not delete by hommer');
      })
      .then(function () {
        done();
        assert.ok(false, 'post hould delete only by owner');
      });
  });

  test('hommer should comment lisa post', function (done) {
    var lisaPost = this.lisaPost;

    hoodie.socialmedia.comment(lisaPost, {text: 'vegan means eat bacon right?!'})
      .fail(done)
      .then(function (post) {
        this.hommerComment = post.commentObject;
        assert.ok(true, 'comment with success');
        done();
      }.bind(this));
  });

  test('lisa should comment lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Lisa', '123', function () {
      hoodie.socialmedia.comment(lisaPost, {text: 'no daddy bacon is an animal!'})
        .fail(done)
        .then(function (post) {
          this.lisaComment = post.commentObject;
          assert.ok(true, 'comment with success');
          done();
        }.bind(this));
    }.bind(this));
  });

  test('bart should comment lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Bart', '123', function () {
      hoodie.socialmedia.comment(lisaPost, {text: 'bacon is not animal, right hommer?'})
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
    })
  });

  test('homer should comment again lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.comment(lisaPost, {text: 'sure bacon is happynes!'})
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
    })
  });

  test('homer should like lisa post', function (done) {
    var lisaPost = this.lisaPost;
    hoodie.socialmedia.count(lisaPost, 'like')
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
  });


  test('lisa should like lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Lisa', '123', function () {
      hoodie.socialmedia.count(lisaPost, 'like')
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
    })
  });


  test('bart should like lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Bart', '123', function () {
      hoodie.socialmedia.count(lisaPost, 'like')
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
    })
  });


  test('hommer should unlike lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.uncount(lisaPost, 'like')
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
    })
  });

  test('cat should like with like lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Cat', '123', function () {
      hoodie.socialmedia.like(lisaPost)
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
    })
  });

  test('dog should like with like lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Dog', '123', function () {
      hoodie.socialmedia.like(lisaPost)
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
    })
  });

  test('Dog should unlike with unlike lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Dog', '123', function () {
      hoodie.socialmedia.unlike(lisaPost)
      .fail(done)
      .then(function (post) {
        assert.ok(true, 'comment with success');
        done();
      });
    })
  });

  test('hommer should get lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.getPost(lisaPost)
        .fail(done)
        .then(function (post) {
          assert.ok(post.postObject.countType.like.length === 3, 'comment with success');
          done();
        });
    })
  });

  test('hommer should not update lisa comment', function (done) {
    var lisaPost = this.lisaPost;
    var lisaComment = this.lisaComment;
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.updateComment(lisaPost, lisaComment)
        .fail(function (err) {
          assert.ok(err, 'comment with success');
          done();
        })
        .then(function () {
          assert.ok(false, 'wrong comment update');
          done();
        });
    })
  });

  test('hommer should not delete lisa comment', function (done) {
    var lisaPost = this.lisaPost;
    var lisaComment = this.lisaComment;
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.deleteComment(lisaPost, lisaComment)
        .fail(function (err) {
          assert.ok(err, 'comment with success');
          done();
        })
        .then(function () {
          assert.ok(false, 'wrong comment update');
          done();
        });
    })
  });

  test('hommer should update his comment', function (done) {
    var lisaPost = this.lisaPost;
    var hommerComment = this.hommerComment;
    hommerComment.text = 'D\'oh!!!!!!!';
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.updateComment(lisaPost, hommerComment)
        .fail(done)
        .then(function (post) {
          assert.ok(post.commentObject.text === hommerComment.text, 'comment with success');
          done();
        });
    })
  });

  test('hommer should delete his comment', function (done) {
    var lisaPost = this.lisaPost;
    var hommerComment = this.hommerComment;
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.deleteComment(lisaPost, hommerComment)
        .fail(function (err) {
          done(err);
        })
        .then(function () {
          assert.ok(true, 'delete comment with success');
          done();
        });
    })
  });

  test('hommer should share lisa post', function (done) {
    var lisaPost = this.lisaPost;
    signinUser('Hommer', '123', function () {
      hoodie.socialmedia.share(lisaPost)
        .fail(function (err) {
          done(err);
        })
        .then(function () {
          assert.ok(true, 'share post with success');
          done();
        });
    })
  });

});
