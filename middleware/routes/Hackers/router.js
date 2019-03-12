const router = require("express").Router();

const jwtRestrict = require("../../auth/jwt/jwtRestrict.js");

router.get("/:id", async (req, res) => {
  res.status(200).json({
    HackerUsername: "Zak",
    HackerSentiment: 0.1054455972,
    HackerCommentCount: 1848
  });
});

router.get("/:id/details", async (req, res) => {
  const sampleResponses = [{"author":"Zak","sentiment":-0.8,"ranking":1,"time":1306966746,"text":"I wouldn\'t mind having an agent. Looking for work is annoying."},{"author":"Zak","sentiment":-0.7,"ranking":1,"time":1195064168,"text":"I wouldn\'t be shocked if it becomes the example app provided with Arc."},{"author":"Zak","sentiment":-0.7,"ranking":0,"time":1194058875,"text":"Did your friends say what it was they hated about Scheme after taking that class? I can see where people might make an association between the language and the difficult tasks they were being asked to perform with it."},{"author":"Zak","sentiment":-0.7,"ranking":0,"time":1306559980,"text":"One would hope you\'re storing the passwords as salted hashes (preferably bcrypt) so that passwords won\'t get leaked no matter how bad you are at database security."},{"author":"Zak","sentiment":-0.6666666667,"ranking":7,"time":1268235683,"text":"<i>Write code that returns the length of a string without using any built-in functions.<\\/i><p>It took me a while to realize that they\'re probably not counting infix operators that behave like functions except for the syntax. Accomplishing this task in Lisp or Haskell would be nearly impossible."},{"author":"Zak","sentiment":-0.65625,"ranking":3,"time":1247698483,"text":"It was irresponsible of Palm to do so. That doesn\'t mean it isn\'t user-hostile and slightly evil for Apple to intentionally break syncing with a third-party device."},{"author":"Zak","sentiment":-0.5,"ranking":1,"time":1190052763,"text":"Outlook and Windows are both expensive. Piracy is an option, but it\'s still a pain."},{"author":"Zak","sentiment":-0.5,"ranking":1,"time":1358362759,"text":"What\'s the legality of distributing a binary-patched app covered by the GPL? Something makes me think it\'s questionable."},{"author":"Zak","sentiment":-0.5,"ranking":2,"time":1301395214,"text":"Fails for me on Chrome 12.0.712.0 dev (Linux)."}]

  res.status(200).json(sampleResponses);
});

module.exports = router;
