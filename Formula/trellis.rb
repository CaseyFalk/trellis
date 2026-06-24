# Homebrew formula for the Trellis CLI.
#
# Installs a self-contained bundle (CLI + its runtime deps, no Astro-plugin peers),
# so no network is needed during `brew install`. `trellis new` fetches @trellis/core
# and the project's build deps at runtime.
#
# Lives in the main repo. Install via:
#   brew tap CaseyFalk/trellis https://github.com/CaseyFalk/trellis
#   brew install trellis
class Trellis < Formula
  desc "Scaffold and grow living, captured knowledge bases for learning anything"
  homepage "https://github.com/CaseyFalk/trellis"
  url "https://github.com/CaseyFalk/trellis/releases/download/v0.1.1/trellis-bundled-0.1.1.tgz"
  sha256 "b213c971d6093bb00efe835c0885c539e653cbe3a6578fcd1135bfa764883623"
  license "MIT"

  depends_on "node"

  def install
    libexec.install "bin", "lib"
    bin.install_symlink libexec/"bin/trellis"
  end

  test do
    assert_match "trellis — scaffold", shell_output("#{bin}/trellis 2>&1")
  end
end
